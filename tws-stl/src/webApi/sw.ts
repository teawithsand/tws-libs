/**
 * Helper for registering service workers.
 * 
 * If you are using SWs you probably want to take a look at these libs:
 * - https://www.npmjs.com/package/service-worker-loader
 * - https://developer.chrome.com/docs/workbox/
 * - With gatsby: https://www.npmjs.com/package/gatsby-plugin-offline
 */
export class SwApiHelper {
	private constructor() {}
	private static innerInstance = new SwApiHelper()

	static get instance() {
		return this.innerInstance
	}

    /**
     * Checks for SW support.
     */
	get isSupported() {
		return (
			typeof window !== "undefined" &&
			typeof window.navigator !== "undefined" &&
			typeof window.navigator.serviceWorker !== "undefined"
		)
	}

	/**
	 * Register service worker with specified path.
	 * Returns wrapper for registration object
	 */
	register = async (path: string, options?: RegistrationOptions) => {
		const registration = await window.navigator.serviceWorker.register(
			path,
			options
		)

		return {
			registration,
			unregister: async () => await registration.unregister(),
		}
	}
}
