export class PlayerError extends Error {}
export class SourcePlayerError extends PlayerError {}
export class MediaPlayerError extends PlayerError {
	constructor(msg: string, public readonly mediaError: MediaError) {
		super(msg)
	}
}
