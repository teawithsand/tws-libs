import { SourcePlayerError } from "../error"

/**
 * Provides source for specified index.
 * It *should* return same source for same index always.
 *
 * Implementations can use it to do things like shuffling or repeating.
 */
export interface PlayerSourceProvider<S, SK> {
	getNextSourceKey(sk: SK | null): SK | null
	getPrevSourceKey(sk: SK | null): SK | null
	providerSourceWithKey(key: SK): S
}

export class ArrayPlayerSourceProvider<S>
	implements PlayerSourceProvider<S, number>
{
	constructor(public readonly arr: S[]) {}

	getNextSourceKey = (sk: number | null): number | null => {
		sk = sk ?? 0
		if (sk >= this.arr.length) return null
		return sk + 1
	}

	getPrevSourceKey = (sk: number | null): number | null => {
		sk = sk ?? 0
		if (sk === 0 || sk >= this.arr.length) return null
		return sk - 1
	}

	providerSourceWithKey = (i: number): S => {
		if (i < this.arr.length) return this.arr[i]
		throw new SourcePlayerError(
			`Source with index ${i} is not available in array with ${this.arr.length} elements`
		)
	}
}
