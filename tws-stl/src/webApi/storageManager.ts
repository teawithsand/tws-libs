export class StorageManagerApiHelper {
	private constructor() {}
	private static innerInstance = new StorageManagerApiHelper()

	public static get instance() {
		return this.innerInstance
	}

	get isSupported() {
		return (
			typeof window !== "undefined" &&
			typeof window.navigator !== "undefined" &&
			"storage" in window.navigator
		)
	}

	estimateStorage = async () => {
		if (!this.isSupported) return null

		try {
			return await navigator.storage.estimate()
		} catch (e) {
			return null
		}
	}

	requestPersistentStorage = async () => {
		if (!this.isSupported) return false

		try {
			return await navigator.storage.persist()
		} catch (e) {
			return false
		}
	}

	isPersistentStorage = async () => {
		if (!this.isSupported) return false

		try {
			return await navigator.storage.persisted()
		} catch (e) {
			return false
		}
	}
}
