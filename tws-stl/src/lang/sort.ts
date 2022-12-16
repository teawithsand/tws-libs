/**
 * Standardized comparator, which makes sorting stuff of type T via `Array.prototype.sort` easy and generic.
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * Returns sorted copy of given array.
 */
export const sorted = <T>(arr: T[], cmp?: Comparator<T>): T[] => {
	const cpy = [...arr]
	cpy.sort(cmp)
	return cpy
}

export const inverseSortResult = (r: number): number => -r

export const inverseComparator =
	<T>(c: Comparator<T>): Comparator<T> =>
	(a, b) =>
		inverseSortResult(c(a, b))

export const compareBigInt = (a: bigint, b: bigint) => {
	const v = a - b
	if (v == BigInt(0)) return 0
	else if (v > BigInt(0)) return 1
	else return -1
}

/**
 * Easy ordering enum for more clear comparator stuff.
 */
export enum Ordering {
	LESS = -1,
	EQUAL = 0,
	GREATER = 1,
}

export const compareStrings: Comparator<string> = (a: string, b: string) =>
	a.localeCompare(b)
export const compareNumbers: Comparator<number | bigint> = (a, b) => {
	if (typeof a !== typeof b) {
		// one is bigint
		a = BigInt(a)
		b = BigInt(b)
	}
	const r: number | bigint = (a as any) - (b as any)
	if (r > 0) return Ordering.GREATER
	if (r < 0) return Ordering.LESS
	return Ordering.EQUAL
}

export const compareStringsNatural: Comparator<string> = (
	a: string,
	b: string
) =>
	a.localeCompare(b, undefined, {
		numeric: true,
		sensitivity: "base",
	})
