import { Milliseconds } from "../../unit"
import {
	PlayerNetworkState,
	PlayerReadyState,
	simplePlayerNetworkStateFromNative,
	simplePlayerReadyStateFromNative,
} from "./state"

type Element = HTMLAudioElement | HTMLMediaElement | HTMLVideoElement

const sanitizeTime = (t: number): number | null =>
	isFinite(t) && t >= 0 ? t * 1000 : null

const flattenBuffered = (ranges: TimeRanges) => {
	const res: {
		start: number
		end: number
	}[] = []
	for (let i = 0; i < ranges.length; i++) {
		const start = sanitizeTime(ranges.start(i))
		const end = sanitizeTime(ranges.end(i))
		if (typeof start !== "number" || typeof end !== "number") continue

		res.push({
			start,
			end,
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

	currentTime: Milliseconds | null
	duration: Milliseconds | null

	buffered: {
		start: Milliseconds
		end: Milliseconds
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
