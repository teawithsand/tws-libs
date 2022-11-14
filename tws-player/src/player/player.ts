import { MediaPlayerError } from "../error"
import { WebAudioFilterManager } from "../filter"
import {
	EmptyPlayerSourceProvider,
	PlayerSourceProvider,
	PlayerSourceResolver,
} from "../source"
import {
	PlayerNetworkState,
	PlayerReadyState,
	readHTMLPlayerState,
} from "../util/native"
import { PlayerConfig, PlayerState } from "./state"
import {
	DefaultStickyEventBus,
	DefaultTaskAtom,
	StickyEventBus,
} from "@teawithsand/tws-stl"
import { castDraft, current, isDraft, produce } from "immer"
import { WritableDraft } from "immer/dist/internal"

type Element = HTMLAudioElement | HTMLMediaElement | HTMLVideoElement

export const IDLE_PORTABLE_PLAYER_STATE: PlayerState<any, any> = {
	playerError: null,
	sourceError: null,
	duration: null,
	position: null,
	isPlaying: false,
	isSeeking: false,
	networkState: PlayerNetworkState.IDLE,
	readyState: PlayerReadyState.NOTHING,

	config: {
		isPlayingWhenReady: false,
		speed: 1,
		preservePitchForSpeed: false,
		volume: 1,
		filters: [],
		allowExternalSetIsPlayingWhenReady: true,
		sourceKey: null,
		sourceProvider: new EmptyPlayerSourceProvider(),
		seekPosition: null,

		forceReloadOnSourceProviderSwap: true, // by default true for backwrards compatibility
	},
}

// TODO(teawithsand): implement swapping source provider/resolver without killing player

/**
 * SimplePlayer, which uses HTMLAudioElement | HTMLMediaElement | HTMLVideoElement
 * in order to provide controls.
 */
export class Player<S, SK> {
	private eventListeners: {
		event: string
		listener: any
	}[] = []

	private sourceCleanup: (() => void) | null = null

	private readonly innerPlayerState: StickyEventBus<PlayerState<S, SK>>
	private readonly filtersHelper: WebAudioFilterManager | null

	private isLoadingSource = false
	private isIsPlayingSynchronizedAfterSourceLoaded = false

	private lastState: PlayerState<S, SK> = IDLE_PORTABLE_PLAYER_STATE
	private readonly loadSourceTaskAtom = new DefaultTaskAtom()

	/**
	 * @deprecated Kept for legacy reasons. Use config access instead.
	 */
	get sourceProvider(): PlayerSourceProvider<S, SK> {
		return this.stateBus.lastEvent.config.sourceProvider
	}

	constructor(
		public readonly sourceResolver: PlayerSourceResolver<S>,
		private readonly element: Element = new Audio()
	) {
		if (window.AudioContext) {
			this.filtersHelper = new WebAudioFilterManager(element)
		} else {
			this.filtersHelper = null
		}

		this.hookToElement()
		this.innerPlayerState = new DefaultStickyEventBus(
			IDLE_PORTABLE_PLAYER_STATE
		)

		this.innerPlayerState.addSubscriber((state) => {
			this.onStateChange(state)
		})
	}

	public get stateBus(): StickyEventBus<PlayerState<S, SK>> {
		return this.innerPlayerState
	}

	public get state(): Readonly<PlayerState<S, SK>> {
		return this.innerPlayerState.lastEvent
	}

	private syncSeek = (newState: PlayerState<S, SK>) => {
		const canSeek =
			!this.isLoadingSource &&
			this.stateBus.lastEvent.config.sourceKey !== null

		// Note: if this seeking model does not work
		// add UUID of seek and check IT rather than seek value
		if (
			canSeek &&
			// Seek in last state should be ignored?
			// I guess so, since it should be quickly set to null once it was
			// performed(also in lastState)
			this.lastState.config.seekPosition !==
				newState.config.seekPosition &&
			newState.config.seekPosition !== null
		) {
			this.element.currentTime = newState.config.seekPosition

			// Note: doing this is kind of crappy and in general should not be done
			// but who really cares
			// I do not
			this.mutateConfig((draft) => {
				draft.seekPosition = null
			})
		}
	}

	private readonly onStateChange = (newState: PlayerState<S, SK>) => {
		this.syncFilters(newState)
		this.syncIsPlayingWhenReady(newState)
		this.syncSource(newState)
		this.syncPlaybackOptions(newState)

		// This has to be below source loading code
		// since if both source and seek are set in single config
		// then we want to seek on the new file rather than the old file
		this.syncSeek(newState)

		this.lastState = newState
	}

	private syncPlaybackOptions = (newState: PlayerState<S, SK>) => {
		if (newState.config.speed !== this.element.playbackRate) {
			this.element.playbackRate = newState.config.speed
		}

		const anyElement = this.element as any
		if (
			"preservesPitch" in anyElement &&
			anyElement.preservesPitch !== newState.config.preservePitchForSpeed
		) {
			anyElement.preservesPitch = newState.config.preservePitchForSpeed
		} else if (
			"mozPreservesPitch" in anyElement &&
			anyElement.mozPreservesPitch !==
				newState.config.preservePitchForSpeed
		) {
			anyElement.mozPreservesPitch = newState.config.preservePitchForSpeed
		}

		if (newState.config.volume !== this.element.volume) {
			this.element.volume = newState.config.volume
		}

		if (this.element.muted) this.element.muted = false
	}

	private syncFilters = (newState: PlayerState<S, SK>) => {
		if (
			this.filtersHelper !== null &&
			newState.config.filters !== this.lastState.config.filters
		) {
			this.filtersHelper.applyFilters(newState.config.filters)
		}
	}

	private syncIsPlayingWhenReady = (newState: PlayerState<S, SK>) => {
		if (
			!this.isLoadingSource &&
			newState.config.sourceKey !== null && // if CSK is null(and we can unset prev source, even though we've tried)
			newState.config.isPlayingWhenReady
		) {
			this.element.play().catch(() => {
				// TODO(teawithsand): this can be used to check if autoplay was banned or not
				// It's useful to detect it somehow. This should be implemented in the future.
				// noop here
				// ignore playing error, we will reset it when we want if needed
			})
		} else {
			this.element.pause()
		}

		if (!this.isLoadingSource) {
			this.isIsPlayingSynchronizedAfterSourceLoaded = true
		}
	}

	private syncSource = (newState: PlayerState<S, SK>) => {
		const provider = newState.config.sourceProvider
		const targetSourceKey = newState.config.sourceKey

		if (
			targetSourceKey !== this.lastState.config.sourceKey ||
			(newState.config.forceReloadOnSourceProviderSwap &&
				newState.config.sourceProvider !==
					this.lastState.config.sourceProvider)
		) {
			const src =
				targetSourceKey !== null
					? provider.providerSourceWithKey(targetSourceKey)
					: null
			const prevSourceCleanup = this.sourceCleanup

			if (prevSourceCleanup) prevSourceCleanup()
			this.sourceCleanup = null

			if (src !== null) {
				// FIXME(teawithsand):
				//   In fact, even though this claim is here and code's is correct but
				//   this code here could use cancelation logic
				//   which would stop pending loadings
				//   from finishing

				const claim = this.loadSourceTaskAtom.claim()

				this.isIsPlayingSynchronizedAfterSourceLoaded = false
				this.isLoadingSource = true
				;(async () => {
					let url: string
					let close: () => void
					try {
						;[url, close] =
							await this.sourceResolver.resolveSourceToURL(src)
					} catch (e) {
						if (!claim.isValid) return
						this.element.src = ""
						// this.sourceError = e
						// TODO: report error

						return
					}
					if (!claim.isValid) {
						close()
						return
					}

					this.element.src = url
					this.sourceCleanup = close

					// load resets playback rate and volume(?)
					// so sync params afterwards
					this.element.load()
					this.syncPlaybackOptions(this.state)

					this.readAndEmitHTMLElementState()
				})().finally(() => {
					if (claim.isValid) {
						this.isLoadingSource = false
					}
				})
			} else {
				// apparently, this does not work
				// instead try to simply always set pause, unless there is source key provided
				// if (this.element.src !== "") {
				// 	this.element.src = ""
				// 	this.readAndEmitHTMLElementState()
				// }

				// TODO(teawithsand): debug this and discover wth actually happens here
				// and hope that some event triggers event update, but we won't trigger it manually
				// as this may trigger infinite recursion, although it shouldn't
				// so idk let's leave this as is for now, seems to work.
				this.element.src = ""
				this.element.load()
				this.isLoadingSource = false
			}
		}
	}

	public setConfig = (config: PlayerConfig<S, SK>) => {
		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				draft.config = castDraft(config)
			})
		)
	}

	public mutateConfig = (
		mutator: (draft: WritableDraft<PlayerConfig<S, SK>>) => void
	) => {
		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				mutator(draft.config)
			})
		)
	}

	private readAndEmitHTMLElementState = () => {
		const playerState = readHTMLPlayerState(this.element)

		let setIsPlayingWhenReady: boolean | null = null
		if (
			!this.isLoadingSource &&
			this.isIsPlayingSynchronizedAfterSourceLoaded &&
			this.sourceCleanup !== null && // AKA source loaded
			!playerState.isEnded &&
			!playerState.error &&
			!playerState.isSeeking
		) {
			// Once we are in ended state
			// pause triggers.
			//
			// Also, when we call load
			// pause gets triggered
			// so this is covered as well
			//
			// Also, setting null source triggers paused case as well
			// so handle it.
			//
			//
			// Moreover, once source is loaded there is short moment before sync of IsPlayingWhenReady is triggered, when we are not playing
			// which may cause this to fire, which is not what we want, so we capture it.

			// getting state like this should be ok, even though it seems a little bit hacky
			if (this.state.config.isPlayingWhenReady) {
				if (playerState.paused) {
					setIsPlayingWhenReady = false
				}
			} else {
				const isReadyStateOk =
					playerState.readyState === PlayerReadyState.FUTURE_DATA ||
					playerState.readyState === PlayerReadyState.ENOUGH_DATA ||
					playerState.readyState === PlayerReadyState.CURRENT_DATA

				if (
					!playerState.paused &&
					isReadyStateOk &&
					playerState.isPlaying
				) {
					setIsPlayingWhenReady = true
				}
			}
		}

		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				draft.isPlaying = playerState.isPlaying
				draft.isSeeking = playerState.isSeeking
				draft.duration = playerState.duration
				draft.position = playerState.currentTime
				draft.networkState = playerState.networkState
				draft.readyState = playerState.readyState

				// Do not report an error of player if we are loading or no source is set
				if (this.isLoadingSource || draft.config.sourceKey == null) {
					draft.playerError = null
				} else {
					draft.playerError = playerState.error
						? new MediaPlayerError(
								"Player state reported an error",
								playerState.error
						  )
						: null
				}

				if (
					draft.config.allowExternalSetIsPlayingWhenReady &&
					setIsPlayingWhenReady !== null
				)
					draft.config.isPlayingWhenReady = setIsPlayingWhenReady
			})
		)
	}

	private onPlaybackEnded = () => {
		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				draft.config.sourceKey = castDraft(
					draft.config.sourceProvider.getNextSourceKey(
						isDraft(draft.config.sourceKey)
							? current(draft.config.sourceKey)
							: (draft.config.sourceKey as any) // any cast hack, but this code should be ok. Fix it if it's not
					)
				)
			})
		)
	}

	private hookToElement = () => {
		const regListener = (event: string, listener: (e: Event) => void) => {
			const actualListener = (e: Event) => {
				listener(e)
			}

			this.element.addEventListener(event, actualListener)
			this.eventListeners.push({
				listener: actualListener,
				event,
			})
		}

		const handleStateChange = () => this.readAndEmitHTMLElementState()

		regListener("error", (e) => {
			e.stopPropagation()
			e.preventDefault()

			handleStateChange()
		})

		regListener("timeupdate", () => handleStateChange())
		regListener("durationchange", () => handleStateChange())
		regListener("ended", () => {
			handleStateChange()
			this.onPlaybackEnded()
		})
		regListener("seeking", () => handleStateChange())
		regListener("seeked", () => handleStateChange())
		regListener("progress", () => handleStateChange())
		regListener("canplay", () => handleStateChange())
		regListener("canplaythrough", () => handleStateChange())
		regListener("waiting", () => handleStateChange())
		regListener("pause", () => handleStateChange())
		regListener("play", () => handleStateChange())
	}

	release = () => {
		this.eventListeners.forEach((e) => {
			this.element.removeEventListener(e.event, e.listener)
		})

		this.element.pause()
		this.element.src = ""

		if (this.sourceCleanup) {
			this.sourceCleanup()
			this.sourceCleanup = null
		}
	}
}
