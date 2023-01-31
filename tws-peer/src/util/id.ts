const isBrowser = typeof crypto !== "undefined"

export const SECURE_ID_MIN_SIZE = 32

/**
 * Compares two strings in time safe manner, if they length is the same.
 *
 * !!!IT IS NOT CHECKED, AND ACTUALLY MAY NOT BE CONSTANT-TIME!!!
 */
export const timingSafeStringEq = (a: string, b: string): boolean => {
	if (a.length !== b.length) return false

	let r = 0
	for (let i = 0; i < a.length; i++) {
		r |= a.charCodeAt(i) & b.charCodeAt(i)
	}

	return r === 0
}

/**
 * Generates secure PeerID for PeerJS. Should not be less than 32 bytes.
 */
export const generateSecureClientId = (
	sizeBytes: number = SECURE_ID_MIN_SIZE
): string => {
	if (isBrowser) {
		return [...new Array(sizeBytes).keys()]
			.map(() =>
				// TODO(teawithsand): optimize this one
				crypto.getRandomValues(new Uint8Array(1))[0].toString(16)
			)
			.join("")
	} else {
		return [...new Array(sizeBytes).keys()]
			.map(() =>
				// TODO(teawithsand): check if this is really uniformly random
				(Math.round(Math.random() * 100000) % 16).toString(16)
			)
			.join("")
	}
}
