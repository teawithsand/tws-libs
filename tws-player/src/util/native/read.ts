import { PlayerNetworkState, PlayerReadyState, simplePlayerNetworkStateFromNative, simplePlayerReadyStateFromNative } from "./state"

type Element = HTMLAudioElement | HTMLMediaElement | HTMLVideoElement

const sanitizeTime = (t: number): number | null =>
	isFinite(t) && t >= 0 ? t : null

const flattenBuffered = (ranges: TimeRanges) => {
	const res: {
		start: number
		end: number
	}[] = []
	for (let i = 0; i < ranges.length; i++) {
		res.push({
			start: ranges.start(i),
			end: ranges.end(i),
		})
	}
	return res
}

export type HTMLPlayerState = {
	error: MediaError | null
	paused: boolean
	// rawNetworkState: number
	// rawReadyState: number
	isSeeking: boolean
	isEnded: boolean

	networkState: PlayerNetworkState
	readyState: PlayerReadyState

	isPlaying: boolean

	currentTime: number | null
	duration: number | null

	buffered: {
		start: number
		end: number
	}[]
}

export const readHTMLPlayerState = (element: Element): HTMLPlayerState => {
	const {
		error,
		paused,
		networkState: rawNetworkState,
		readyState: rawReadyState,
		currentTime,
		duration,
		seeking,
		ended,
		buffered,
	} = element

	const networkState = simplePlayerNetworkStateFromNative(rawNetworkState)
	const readyState = simplePlayerReadyStateFromNative(rawReadyState)

	return {
		error,
		paused,
		isEnded: ended,
		currentTime: sanitizeTime(currentTime),
		duration: sanitizeTime(duration),
		isSeeking: seeking,

		// rawNetworkState,
		// rawReadyState,

		readyState,
		networkState,

		buffered: flattenBuffered(buffered),

		isPlaying:
			!seeking &&
			!paused &&
			!ended &&
			readyState === PlayerReadyState.ENOUGH_DATA,
	}
}
