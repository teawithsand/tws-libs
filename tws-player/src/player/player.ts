import {
	DefaultStickyEventBus,
	DefaultTaskAtom,
	StickyEventBus,
} from "@teawithsand/tws-stl"
import { castDraft, produce } from "immer"
import { WritableDraft } from "immer/dist/internal"
import { MediaPlayerError } from "../error"
import { WebAudioFilterManager } from "../filter"
import {
	DEFAULT_PLAYER_SOURCE_COMPARATOR,
	PlayerSourceComparator,
} from "../source/compare"
import {
	PlayerNetworkState,
	PlayerReadyState,
	readHTMLPlayerState,
} from "../util/native"
import { PlayerConfig, PlayerState } from "./state"

type Element = HTMLAudioElement | HTMLMediaElement | HTMLVideoElement

export const IDLE_PORTABLE_PLAYER_STATE: PlayerState = {
	playerError: null,
	sourceError: null,
	duration: null,
	positionUpdatedAfterSeek: true,
	position: null,
	isPlaying: false,
	isSeeking: false,
	isEnded: false,
	networkState: PlayerNetworkState.IDLE,
	readyState: PlayerReadyState.NOTHING,

	config: {
		isPlayingWhenReady: false,
		speed: 1,
		preservePitchForSpeed: false,
		volume: 1,
		filters: [],
		allowExternalSetIsPlayingWhenReady: true,
		source: null,
		seekPosition: null,
	},
}

// TODO(teawithsand): implement swapping source provider/resolver without killing player

/**
 * SimplePlayer, which uses HTMLAudioElement | HTMLMediaElement | HTMLVideoElement
 * in order to provide controls.
 */
export class Player {
	private eventListeners: {
		event: string
		listener: any
	}[] = []

	private sourceCleanup: (() => void) | null = null

	private readonly innerPlayerState: StickyEventBus<PlayerState>
	private readonly filtersHelper: WebAudioFilterManager | null

	private isLoadingSource = false
	private isIsPlayingSynchronizedAfterSourceLoaded = false

	private lastState: PlayerState = IDLE_PORTABLE_PLAYER_STATE
	private readonly loadSourceTaskAtom = new DefaultTaskAtom()

	constructor(
		private readonly comparator: PlayerSourceComparator = DEFAULT_PLAYER_SOURCE_COMPARATOR,
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

	public get stateBus(): StickyEventBus<PlayerState> {
		return this.innerPlayerState
	}

	public get state(): Readonly<PlayerState> {
		return this.innerPlayerState.lastEvent
	}

	private syncSeek = (newState: PlayerState) => {
		const canSeek =
			!this.isLoadingSource &&
			this.stateBus.lastEvent.config.source !== null &&
			newState.readyState !== PlayerReadyState.NOTHING

		const seekPositionMillis = newState.config.seekPosition

		// Note: if this seeking model does not work
		// add UUID of seek and check IT rather than seek value
		if (
			canSeek &&
			// Seek in last state should be ignored?
			// I guess so, since it should be quickly set to null once it was
			// performed(also in lastState)
			// this.lastState.config.seekPosition !== newState.config.seekPosition &&
			seekPositionMillis !== null
		) {
			const seekPositionSeconds = seekPositionMillis / 1000
			this.element.currentTime = seekPositionSeconds

			// Note: doing this(modifying parent in event) is kind of crappy and in general should not be done
			// as it may lead to infinite recursion
			// but who really cares
			// I do not
			this.innerPlayerState.emitEvent(
				produce(this.innerPlayerState.lastEvent, (draft) => {
					draft.positionUpdatedAfterSeek = false
					draft.config.seekPosition = null
				})
			)
		}
	}

	private readonly onStateChange = (newState: PlayerState) => {
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

	private syncPlaybackOptions = (newState: PlayerState) => {
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

	private syncFilters = (newState: PlayerState) => {
		if (
			this.filtersHelper !== null &&
			newState.config.filters !== this.lastState.config.filters
		) {
			this.filtersHelper.applyFilters(newState.config.filters)
		}
	}

	private syncIsPlayingWhenReady = (newState: PlayerState) => {
		if (
			!this.isLoadingSource &&
			newState.config.source !== null && // if CSK is null(and we can unset prev source, even though we've tried)
			newState.config.isPlayingWhenReady &&
			!newState.isEnded
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

	private syncSource = (newState: PlayerState) => {
		const lastSource = this.lastState.config.source
		const targetSource = newState.config.source

		if (
			(lastSource !== null) !== (targetSource !== null) ||
			(targetSource &&
				lastSource &&
				!this.comparator.equals(lastSource, targetSource))
		) {
			const prevSourceCleanup = this.sourceCleanup

			if (prevSourceCleanup) prevSourceCleanup()
			this.sourceCleanup = null

			if (targetSource !== null) {
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
					let close: () => Promise<void>
					try {
						const claim = await targetSource.claimUrl()
						// close = claim.close.bind(claim)
						close = async () => await claim.close() // using closure is preferred by me I guess
						url = claim.url
					} catch (e) {
						if (!claim.isValid) return
						this.element.src = ""
						// this.sourceError = e
						// TODO: report error

						return
					}
					if (!claim.isValid) {
						await close()
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

	public setConfig = (config: PlayerConfig) => {
		this.innerPlayerState.emitEvent(
			produce(this.innerPlayerState.lastEvent, (draft) => {
				draft.config = castDraft(config)
			})
		)
	}

	public mutateConfig = (
		mutator: (draft: WritableDraft<PlayerConfig>) => void
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
				draft.positionUpdatedAfterSeek = true
				draft.networkState = playerState.networkState
				draft.readyState = playerState.readyState
				draft.isEnded = playerState.isEnded

				// Do not report an error of player if we are loading or no source is set
				if (this.isLoadingSource || draft.config.source == null) {
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
		regListener("ended", () => handleStateChange())
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
