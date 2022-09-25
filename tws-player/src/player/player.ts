import { DefaultStickyEventBus, DefaultTaskAtom } from "@teawithsand/tws-stl"
import StickyEventBus from "@teawithsand/tws-stl/dist/event-bus/stickyEventBus"
import { produce, castDraft, current, isDraft } from "immer"
import { MediaPlayerError } from "../error"
import { WebAudioFilterManager } from "../filter"
import {
	PlayerNetworkState,
	PlayerReadyState,
	readHTMLPlayerState,
} from "../util/native"
import { PlayerSourceProvider, PlayerSourceResolver } from "../source"
import { PlayerConfig, PlayerState } from "./state"

type Element = HTMLAudioElement | HTMLMediaElement | HTMLVideoElement

export const IDLE_PORTABLE_PLAYER_STATE: PlayerState<any> = {
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
		speed: 0,
		preservePitchForSpeed: false,
		volume: 0,
		filters: [],
		allowExternalSetIsPlayingWhenReady: false,
		currentSourceKey: null,
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

	private readonly innerPlayerState: StickyEventBus<PlayerState<SK>>
	private readonly filtersHelper: WebAudioFilterManager | null

	private isLoadingSource = false
	private isIsPlayingSynchronizedAfterSourceLoaded = false

	private lastState: PlayerState<SK> = IDLE_PORTABLE_PLAYER_STATE
	private readonly loadSourceTaskAtom = new DefaultTaskAtom()

	constructor(
		public readonly sourceProvider: PlayerSourceProvider<S, SK>,
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

	public get stateBus(): StickyEventBus<PlayerState<SK>> {
		return this.innerPlayerState
	}

	public get state(): Readonly<PlayerState<SK>> {
		return this.innerPlayerState.lastEvent
	}

	private readonly onStateChange = (newState: PlayerState<SK>) => {
		this.syncFilters(newState)
		this.syncIsPlayingWhenReady(newState)
		this.syncSource(newState)
		this.syncPlaybackOptions(newState)

		this.lastState = newState
	}

	private syncPlaybackOptions = (newState: PlayerState<SK>) => {
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
	}

	private syncFilters = (newState: PlayerState<SK>) => {
		if (
			this.filtersHelper !== null &&
			newState.config.filters !== this.lastState.config.filters
		) {
			this.filtersHelper.applyFilters(newState.config.filters)
		}
	}

	private syncIsPlayingWhenReady = (newState: PlayerState<SK>) => {
		if (!this.isLoadingSource && newState.config.isPlayingWhenReady) {
			this.element.play().catch(() => {
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

	private syncSource = (newState: PlayerState<SK>) => {
		const targetSourceKey = newState.config.currentSourceKey

		if (targetSourceKey !== this.lastState.config.currentSourceKey) {
			const src = targetSourceKey
				? this.sourceProvider.providerSourceWithKey(targetSourceKey)
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
				if (this.element.src !== "") {
					this.element.src = ""
					this.readAndEmitHTMLElementState()
				}
				this.isLoadingSource = false
			}
		}
	}

	public setConfig = (config: PlayerConfig<SK>) => {
		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				draft.config = castDraft(config)
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

				draft.playerError = playerState.error
					? new MediaPlayerError(
							"Player state reported an error",
							playerState.error
					  )
					: null

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
				draft.config.currentSourceKey = castDraft(
					this.sourceProvider.getNextSourceKey(
						isDraft(draft.config.currentSourceKey)
							? current(draft.config.currentSourceKey)
							: (draft.config.currentSourceKey as any) // any cast hack, but this code should be ok. Fix it if it's not
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
