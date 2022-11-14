export const isTimeNumber = (n: number | null | undefined) =>
	(typeof n === "number" || typeof n === "bigint") && n >= 0 && isFinite(n)

export const timeNumberOrNull = (n: number): number | null => {
	if (!isTimeNumber(n)) return null
	return n
}

export const timeNumberOrNegative = (n: number): number => {
	if (!isTimeNumber(n)) return -1
	return n
}
