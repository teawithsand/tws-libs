import { MediaPlayerError, SourcePlayerError } from "../error"
import { AudioFilter } from "../filter"
import { PlayerSourceProvider } from "../source"
import { Milliseconds } from "../unit"
import { PlayerNetworkState, PlayerReadyState } from "../util/native"

export type PlayerConfig<S, SK> = {
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
	 * If you use media session set this to false, as media session should catch all headset commands and stuff.
	 */
	allowExternalSetIsPlayingWhenReady: boolean

	/**
	 * Stopped/Ended state is when this is set to null. This is method to detect end of playlist.
	 */
	sourceKey: SK | null

	/**
	 * Source provider used to provide sources for this player. Can be swapped.
	 */
	sourceProvider: PlayerSourceProvider<S, SK>

	/**
	 * If true, swapping source provider even if key didn't change causes player to reload source. New provider
	 * may have different source at same key. However this behavior sometimes may be not desired.
	 *
	 * This flag is capable of changing this. It's user responsibility to ensure that new provider has same
	 * source at given key.
	 */
	forceReloadOnSourceProviderSwap: boolean

	/**
	 * Defaults to null. Causes player to perform seek to given position.
	 * Once seek is done, this value is set to null again.
	 */
	seekPosition: Milliseconds | null
}

export type PlayerState<S, SK> = {
	playerError: MediaPlayerError | null
	sourceError: SourcePlayerError | null

	/**
	 * Once seek is performed, position is not automatically updated.
	 * That is for a simple reason - it's inner player responsibility to report new one, once we changed it.
	 * 
	 * New position may be out of bound or be unreachable or some other thing may go wrong, so it can't be set directly.
	 * Any position reading(which should occur ASAP after seek) will set this value to true
	 */
	positionUpdatedAfterSeek: boolean
	position: Milliseconds | null
	duration: Milliseconds | null

	isPlaying: boolean
	isSeeking: boolean

	networkState: PlayerNetworkState
	readyState: PlayerReadyState

	config: PlayerConfig<S, SK>
}
