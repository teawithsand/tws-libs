import { MediaPlayerError, SourcePlayerError } from "../error"
import { AudioFilter } from "../filter"
import { PlayerNetworkState, PlayerReadyState } from "../util/native"

export type PlayerConfig<SK> = {
	isPlayingWhenReady: boolean

	speed: number
	preservePitchForSpeed: boolean
	volume: number

	/**
	 * WebAudio is not used for playback directly, as for now it does not support streaming.
	 * In other words: you have to load entire mp3 file to memory in order to use it.
	 *
	 * That being said, you can use web audio element to obtain access to WebAudio context, which is what
	 * this option does.
	 *
	 * Ignored when no web audio support is detected.
	 *
	 * @see AudioFilter
	 */
	filters: AudioFilter[]

	/**
	 * If true, Player will change isPlayingWhenReady when it detects that audio/video element has changed it's isPlaying
	 * parameter on it's own.
	 *
	 * Firefox does this when no media session is registered.
	 * If you use media session set this to false, as media session should catch all headset command and stuff.
	 * If you use
	 */
	allowExternalSetIsPlayingWhenReady: boolean

	/**
	 * Ended state when this is set to null.
	 */
	currentSourceKey: SK | null

	/**
	 * Defaults to null. Causes player to perform seek to given position in millis. 
	 * Once seek is done, this value is set to null again.
	 */
	currentPositionSeek: number | null
}

export type PlayerState<SK> = {
	playerError: MediaPlayerError | null
	sourceError: SourcePlayerError | null

	position: number | null
	duration: number | null

	isPlaying: boolean
	isSeeking: boolean
	// isEnded: boolean // now handled by currentSourceIndex

	networkState: PlayerNetworkState
	readyState: PlayerReadyState

	config: PlayerConfig<SK>
}
