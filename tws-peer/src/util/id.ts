const isBrowser = typeof crypto !== "undefined"

export const SECURE_ID_MIN_SIZE = 32

/**
 * Generates secure PeerID for PeerJS. Should not be less than 32 bytes.
 */
export const generateSecureClientId = (
	sizeBytes: number = SECURE_ID_MIN_SIZE
): string => {
	if (isBrowser) {
		return [...new Array(sizeBytes).keys()].map(() =>
			// TODO(teawithsand): optimize this one
			crypto.getRandomValues(new Uint8Array(1))[0].toString(16)
		).join("")
	} else {
		return [...new Array(sizeBytes).keys()].map(() =>
			// TODO(teawithsand): check if this is really uniformly random
			Math.max(0, Math.round(Math.random() * 256) - 1).toString(16)
		).join("")
	}
}
