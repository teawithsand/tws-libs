export const readStringConstSize = (ab: ArrayBuffer, sz: number): string => {
	const v = new Uint8Array(ab)
	let s = ""
	for (let i = 0; i < sz; i++) {
		if (v[i] === 0) break // emulate C's behavior
		s += String.fromCharCode(v[i])
	}
	return s
}

export const readPositiveFixedDecimalNumber = (
	ab: ArrayBuffer,
	sz: number
): number | null => {
	const text = readStringConstSize(ab, sz)
	const n = parseInt(text)

	return n > 0 && isFinite(n) ? n : null
}

export const mustReadPositiveFixedDecimalNumber = (
	ab: ArrayBuffer,
	sz: number
): number => {
	const r = readPositiveFixedDecimalNumber(ab, sz)
	if (r === null) throw new Error("Expected number but not found")
	return r
}
