import { SourcePlayerError } from "../error"
import { throwExpression } from "@teawithsand/tws-stl"

/**
 * Player source provider, which has all sources comming from some array.
 *
 * Their order(get prev/next source key) may differ though when ordered is false.
 * Looping providers(providing prev of fist as last either/or providing first as next of last element) should have
 * ordered flag set if aside from that they are ordered.
 */
export interface CollectionPlayerSourceProvider<S> {
	readonly ordered: boolean
	readonly sources: Readonly<S[]>
}

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

export class EmptyPlayerSourceProvider
	implements
		PlayerSourceProvider<any, any>,
		CollectionPlayerSourceProvider<any>
{
	public readonly ordered: boolean = true
	public readonly sources: readonly any[] = []

	getNextSourceKey = (sk: any) => {
		return null
	}
	getPrevSourceKey = (sk: any) => {
		return null
	}
	providerSourceWithKey(key: any) {
		throw new SourcePlayerError(
			`Tried to get source with key ${key} from empty player`
		)
	}
}

export class MapPlayerSourceProvider<S>
	implements
		PlayerSourceProvider<S, string>,
		CollectionPlayerSourceProvider<S>
{
	public readonly ordered = true
	private readonly map: Map<
		string,
		{
			source: S
			prev: string | null
			next: string | null
		}
	> = new Map()

	constructor(
		public readonly sources: S[],
		private readonly idLoader: (source: S) => string
	) {
		for (let i = 0; i < sources.length; i++) {
			const s = sources[i]
			const next = sources[i + 1] ?? null
			const prev = sources[i - 1] ?? null

			const id = this.idLoader(s)
			if (this.map.has(id))
				throw new Error(`Source with id ${id} exists twice`)

			this.map.set(id, {
				source: s,
				next: next ? idLoader(next) : null,
				prev: prev ? idLoader(prev) : null,
			})
		}
	}

	getNextSourceKey = (sk: string | null): string | null => {
		if (this.sources.length === 0) return null
		if (sk === null) {
			return this.idLoader(this.sources[0]) // just return first element
		}

		return this.map.get(sk)?.next ?? null
	}

	getPrevSourceKey = (sk: string | null): string | null => {
		if (this.sources.length === 0) return null
		if (sk === null) return null
		return this.map.get(sk)?.prev ?? null
	}

	providerSourceWithKey = (key: string): S => {
		return (
			this.map.get(key)?.source ??
			throwExpression(
				new SourcePlayerError(`Source with ${key} does not exist`)
			)
		)
	}
}

export class ArrayPlayerSourceProvider<S>
	implements
		PlayerSourceProvider<S, number>,
		CollectionPlayerSourceProvider<S>
{
	public readonly ordered: boolean = true

	constructor(public readonly sources: S[]) {}

	getNextSourceKey = (sk: number | null): number | null => {
		sk = sk ?? 0
		if (sk >= this.sources.length) return null
		return sk + 1
	}

	getPrevSourceKey = (sk: number | null): number | null => {
		sk = sk ?? 0
		if (sk === 0 || sk >= this.sources.length) return null
		return sk - 1
	}

	providerSourceWithKey = (i: number): S => {
		if (i < this.sources.length) return this.sources[i]
		throw new SourcePlayerError(
			`Source with index ${i} is not available in array with ${this.sources.length} elements`
		)
	}
}
