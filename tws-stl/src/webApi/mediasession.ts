import { DefaultEventBus, Subscribable } from "../eventBus"

export type MediaSessionMetadata = {
	title: string
	artist: string
	album: string
	artwork: {
		src: string
		sizes: string
		type: string
	}[]
}

export type MediaSessionPositionState = {
	duration: number | null // if null then inf stream
	position: number // may not be greater than duration, if it's not null
	playbackRate: number // must be > 0
}

export enum MediaSessionEventType {
	PLAY = 1,
	PAUSE = 2,
	STOP = 3,
	SEEK_BACKWARD = 4,
	SEEK_FORWARD = 5,
	SEEK_TO = 6,
	PREVIOUS_TRACK = 7,
	NEXT_TRACK = 8,
	SKIP_AD = 9,
}

export type MediaSessionEvent =
	| {
			type: MediaSessionEventType.PLAY
	  }
	| {
			type: MediaSessionEventType.PAUSE
	  }
	| {
			type: MediaSessionEventType.STOP
	  }
	| {
			type: MediaSessionEventType.SEEK_BACKWARD
			by: number | null
	  }
	| {
			type: MediaSessionEventType.SEEK_FORWARD
			by: number | null
	  }
	| {
			type: MediaSessionEventType.SEEK_TO
			to: number | null
			fastSeek: boolean | null
	  }
	| {
			type: MediaSessionEventType.PREVIOUS_TRACK
	  }
	| {
			type: MediaSessionEventType.NEXT_TRACK
	  }
	| {
			type: MediaSessionEventType.SKIP_AD
	  }

// Docs:
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setPositionState

export type MediaSessionActionType =
	| "play"
	| "pause"
	| "stop"
	| "seekbackward"
	| "seekforward"
	| "seekto"
	| "previoustrack"
	| "nexttrack"
	| "skipad"

export const allMediaSessionActions: MediaSessionActionType[] = [
	"play",
	"pause",
	"stop",
	"seekbackward",
	"seekforward",
	"seekto",
	"previoustrack",
	"nexttrack",
	"skipad",
]

const tuplesToMap = <T, E>(iterable: Iterable<[T, E]>): Map<T, E> => {
	const m = new Map()
	for (const [k, v] of iterable) m.set(k, v)
	return m
}

const mediaSessionMetadataEquals = (
	m1: MediaSessionMetadata | null,
	m2: MediaSessionMetadata | null
) => {
	if (m1 === m2) return true

	if (!m1 || !m2) return false
	if (m1.album !== m2.album) return false
	if (m1.artist !== m2.artist) return false
	if (m1.title !== m2.title) return false
	if (m1.artwork.length !== m2.artwork.length) return false

	if (
		!m1.artwork.every((v1, i) => {
			const v2 = m2.artwork[i]

			if (v1.sizes !== v2.sizes) return false
			if (v1.src !== v2.src) return false
			if (v1.type !== v2.type) return false

			return true
		})
	) {
		return false
	}

	return true
}

const mediaSessionPositionStateEquals = (
	m1: MediaSessionPositionState | null,
	m2: MediaSessionPositionState | null
) => {
	if (m1 === m2) return true

	if (!m1 || !m2) return false
	if (m1.duration !== m2.duration) return false
	if (m1.playbackRate !== m2.playbackRate) return false
	if (m1.position !== m2.position) return false

	return true
}

/**
 * Note: instances of this class should't be constructed manually.
 * Instead use global instance.
 *
 * @see MediaSessionHelper
 */
export class MediaSessionApiHelper {
	private static innerInstance = new MediaSessionApiHelper()
	static get instance() {
		return this.innerInstance
	}

	private constructor() {
		this.setSupportedActions(allMediaSessionActions)
	}

	private checkSupport = () => {
		return (
			typeof window !== "undefined" &&
			window.navigator &&
			window.navigator.mediaSession
		)
	}

	private innerEventBus = new DefaultEventBus<MediaSessionEvent>()

	get eventBus(): Subscribable<MediaSessionEvent> {
		return this.innerEventBus
	}

	public get isSupported() {
		return this.checkSupport()
	}

	private supportedActions: Set<MediaSessionActionType> = new Set()

	private lastSetMediaSessionMetadata: MediaSessionMetadata | null = null
	private lastSetMediaPositionState: MediaSessionPositionState | null = null

	private readonly actionHandlers: Map<
		MediaSessionActionType,
		(e: any) => void
	> = tuplesToMap([
		[
			"play",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.PLAY,
				}),
		],
		[
			"pause",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.PAUSE,
				}),
		],

		[
			"stop",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.STOP,
				}),
		],
		[
			"seekbackward",
			(details: any) =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.SEEK_BACKWARD,
					by: details.seekOffset ?? null,
				}),
		],
		[
			"seekforward",
			(details: any) =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.SEEK_FORWARD,
					by: details.seekOffset ?? null,
				}),
		],
		[
			"seekto",
			(details: any) =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.SEEK_TO,
					to: details.seekTime ?? null,
					fastSeek: details.fastSeek ?? null,
				}),
		],
		[
			"previoustrack",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.PREVIOUS_TRACK,
				}),
		],
		[
			"nexttrack",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.NEXT_TRACK,
				}),
		],
		[
			"skipad",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.SKIP_AD,
				}),
		],
	])

	setSupportedActions = (
		actions:
			| MediaSessionActionType[]
			| Iterable<MediaSessionActionType>
			| Set<MediaSessionActionType>
	) => {
		// make a copy + cast if needed
		const castedActions = new Set(actions)

		const removedActions = [...this.supportedActions.values()].filter(
			(v) => !castedActions.has(v)
		)

		const addedActions = [...castedActions.values()].filter(
			(v) => !this.supportedActions.has(v)
		)

		if (this.checkSupport()) {
			for (const a of removedActions) {
				navigator.mediaSession.setActionHandler(a, null)
			}

			for (const a of addedActions) {
				const h = this.actionHandlers.get(a)
				if (!h)
					throw new Error(
						`Unreachable code - no handler for action ${a}`
					)
				navigator.mediaSession.setActionHandler(a, h)
			}
		}

		this.supportedActions = castedActions
	}

	setMetadata = (metadata: MediaSessionMetadata | null) => {
		if (this.checkSupport()) {
			if (
				!mediaSessionMetadataEquals(
					metadata,
					this.lastSetMediaSessionMetadata
				)
			) {
				navigator.mediaSession.metadata = metadata
					? new MediaMetadata(metadata)
					: null
				if (metadata) {
					this.lastSetMediaSessionMetadata = {
						...metadata,
						artwork: [...metadata.artwork],
					}
				} else {
					this.lastSetMediaSessionMetadata = null
				}
			}
		}
	}

	setPlaybackState = (state: "playing" | "paused" | "none") => {
		if (this.checkSupport()) navigator.mediaSession.playbackState = state
	}

	setPositionState = (state: MediaSessionPositionState) => {
		if (this.checkSupport() && navigator.mediaSession.setPositionState) {
			if (
				!mediaSessionPositionStateEquals(
					this.lastSetMediaPositionState,
					state
				)
			) {
				if (state.playbackRate === 0)
					throw new Error(
						"Playback rate may not be zero, it has to be positive or negative integer(neg if playing backwards)"
					)

				this.lastSetMediaPositionState = { ...state }

				let duration = state.duration
				if (duration === null) {
					duration = Infinity
				}

				if (isNaN(duration)) duration = 0
				if (duration < 0) duration = 0

				// Even though MDN says otherwise
				// Firefox does not like duration which is +Infinity
				// Tested at ff between 102 and 104
				// I forgot to note the version down ¯\_(ツ)_/¯
				if (!isFinite(duration)) {
					duration = 24 * 60 * 60 * 30
				}

				let position = state.position
				if (!isFinite(position) || isNaN(position) || position < 0)
					position = 0

				position = Math.min(position, duration)

				navigator.mediaSession.setPositionState({
					playbackRate: state.playbackRate,
					duration,
					position,
				})
			}
		}
	}
}
