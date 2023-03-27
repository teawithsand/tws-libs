import { DefaultEventBus, Subscribable } from "../eventBus"
import { generateUUID } from "../lang"

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
	NEXT_SLIDE = 10,
	PREVIOUS_SLIDE = 11,
	HANG_UP = 12,
	TOGGLE_CAMERA = 13,
	TOGGLE_MICROPHONE = 14,
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
	| {
			type: MediaSessionEventType.NEXT_SLIDE
	  }
	| {
			type: MediaSessionEventType.PREVIOUS_SLIDE
	  }
	| {
			type: MediaSessionEventType.HANG_UP
	  }
	| {
			type: MediaSessionEventType.TOGGLE_CAMERA
	  }
	| {
			type: MediaSessionEventType.TOGGLE_MICROPHONE
	  }

// Docs:
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler
// https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setPositionState

export type MediaSessionActionType =
	// playback stuff
	| "play"
	| "pause"
	| "stop"
	| "seekbackward"
	| "seekforward"
	| "seekto"
	| "previoustrack"
	| "nexttrack"
	// ads
	| "skipad"
	// presentation
	| "previousslide"
	| "nextslide"
	// calls
	| "hangup"
	| "togglecamera"
	| "togglemicrophone"

export const allMediaSessionActions: Readonly<MediaSessionActionType[]> = [
	"play",
	"pause",
	"stop",
	"seekbackward",
	"seekforward",
	"seekto",
	"previoustrack",
	"nexttrack",
	"skipad",
	"previousslide",
	"nextslide",
	"togglecamera",
	"togglemicrophone",
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

	private initialized = false
	private ensureInitialized = () => {
		if (!this.initialized) {
			if (this.checkSupport()) this.setSupportedActions([])
		}

		this.initialized = true
	}

	private constructor() {}

	private checkSupport = (): boolean => {
		return !!(
			typeof window !== "undefined" &&
			window.navigator &&
			window.navigator.mediaSession
		)
	}

	private innerEventBus = new DefaultEventBus<MediaSessionEvent>()

	get eventBus(): Subscribable<MediaSessionEvent> {
		return this.innerEventBus
	}

	public get isSupported(): boolean {
		return this.checkSupport()
	}

	private activeActions: Set<MediaSessionActionType> = new Set()
	private activationResults: Map<MediaSessionActionType, any | null> =
		new Map()

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
		[
			"nextslide",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.NEXT_SLIDE,
				}),
		],
		[
			"previousslide",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.PREVIOUS_SLIDE,
				}),
		],
		[
			"hangup",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.HANG_UP,
				}),
		],
		[
			"togglecamera",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.TOGGLE_CAMERA,
				}),
		],
		[
			"togglemicrophone",
			() =>
				this.innerEventBus.emitEvent({
					type: MediaSessionEventType.TOGGLE_MICROPHONE,
				}),
		],
	])

	/**
	 * Gets set of actions, which are *really* active. It means that they were set
	 * using setSupportedActions AND they are supported by browser.
	 */
	getActiveActions = (): MediaSessionActionType[] => [...this.activeActions]

	/**
	 * Returns errors that occurred while this manager tried to activate/deactivate actions.
	 * It includes all actions used in last call setActiveActions.
	 */
	getActivationResults = (): {
		[k in keyof MediaSessionActionType]: any | null
	} => {
		const v = Object.fromEntries([...this.activationResults.entries()])
		return v as { [k in keyof MediaSessionActionType]: any | null }
	}

	/**
	 * Sets actions that will be handled on event bus.
	 *
	 * Automatically removes actions, which are not supported by browser.
	 *
	 * @deprecated use setActiveActions instead, as this method is poorly named
	 */
	setSupportedActions = (
		actions:
			| MediaSessionActionType[]
			| Iterable<MediaSessionActionType>
			| Set<MediaSessionActionType>
	) => {
		// this.ensureInitialized() // this one may not be called here
		this.initialized = true

		// make a copy + cast if needed
		const desiredActions = new Set(actions)

		const removedActions = [...this.activeActions.values()].filter(
			(v) => !desiredActions.has(v)
		)

		const addedActions = [...desiredActions.values()].filter(
			(v) => !this.activeActions.has(v)
		)

		const unsupportedActions = new Set<MediaSessionActionType>()
		const results: Map<MediaSessionActionType, any | null> = new Map()

		for (const a of desiredActions) {
			results.set(a, null)
		}

		if (this.checkSupport()) {
			for (const a of removedActions) {
				results.set(a, null)
				try {
					// cast a to be MSA, as TS does not know all latest MDN-listed actions
					navigator.mediaSession.setActionHandler(
						a as MediaSessionAction,
						null
					)
				} catch (e) {
					results.set(a, e)

					// HACK(teawithsand): in chrome skipad may not be set, which causes this to throw
					// so just ignore it for now
					// see https://github.com/w3c/mediasession/issues/228 for more info

					unsupportedActions.add(a) // it's not required, but it's fine
				}
			}

			for (const a of addedActions) {
				results.set(a, null)
				const h = this.actionHandlers.get(a)
				if (!h) {
					throw new Error(
						`Unreachable code - no handler for action ${a}`
					)
				}
				try {
					// cast a to be MSA, as TS does not know all latest MDN-listed actions
					navigator.mediaSession.setActionHandler(
						a as MediaSessionAction,
						h
					)
				} catch (e) {
					results.set(a, e)

					// HACK(teawithsand): in chrome skipad may not be set, which causes this to throw
					// so just ignore it for now
					// see https://github.com/w3c/mediasession/issues/228 for more info

					unsupportedActions.add(a)
				}
			}
		} else {
			const e = new Error("Media session not supported by this browser")
			for (const a of addedActions) {
				unsupportedActions.add(a)
				results.set(a, e)
			}
			for (const a of removedActions) {
				unsupportedActions.add(a)
				results.set(a, e)
			}
			for (const a of desiredActions) {
				results.set(a, e)
			}
		}

		unsupportedActions.forEach((a) => desiredActions.delete(a))
		this.activeActions = desiredActions
		this.activationResults = results
	}

	setMetadata = (metadata: MediaSessionMetadata | null) => {
		this.ensureInitialized()
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

	setActiveActions = this.setSupportedActions

	setPlaybackState = (state: "playing" | "paused" | "none") => {
		this.ensureInitialized()
		if (this.checkSupport()) navigator.mediaSession.playbackState = state
	}

	setPositionState = (state: MediaSessionPositionState) => {
		this.ensureInitialized()
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
				// I forgot to write the exact version down ¯\_(ツ)_/¯
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

	/**
	 * Since Chrome on android loves to randomly remove notification and
	 * thus clear metadata of media session _without_ killing js vm.
	 * 
	 * It makes next call to setMetadata always take effect.
	 */
	clearMetadataCache = () => {
		this.lastSetMediaSessionMetadata = {
			album: generateUUID(),
			artist: generateUUID(),
			artwork: [],
			title: generateUUID(),
		}
	}

	/**
	 * Since Chrome on android loves to randomly remove notification and
	 * thus clear metadata of media session _without_ killing js vm.
	 * 
	 * It makes next call to setPositionState always take effect.
	 */
	clearPlaybackStateCache = () => {
		this.lastSetMediaPositionState = {
			duration: Math.random(),
			playbackRate: Math.random(),
			position: Math.random(),
		}
	}
}
