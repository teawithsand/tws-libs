/**
 * Standardized comparator, which makes sorting stuff of type T via `Array.prototype.sort` easy and generic.
 */
export type Comparator<T> = (a: T, b: T) => number

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

export const compareStrings = (a: string, b: string) => a.localeCompare(b)
export const compareNumbers = (a: number, b: number) => a - b
