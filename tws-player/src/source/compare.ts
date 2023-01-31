import { PlayerSource } from "."

/**
 * Tool, which is used to compare two sources for identity.
 *
 * It's purpose is to determine if source has changed or not.
 */
export interface PlayerSourceComparator {
	equals: (a: PlayerSource, b: PlayerSource) => boolean
}

export const DEFAULT_PLAYER_SOURCE_COMPARATOR: PlayerSourceComparator =
	Object.freeze<PlayerSourceComparator>({
		equals: (a, b) => a === b,
	})
