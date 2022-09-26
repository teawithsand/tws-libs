// TODO: make it initializable manager with access to some local storage method, which would be capable of keeping
//  track of switches from PWA to web app and changing display modes, as there are many of them in PWA.
//
// Also PWA manifest entry point detection based method could be implemented here.

export class PwaApiHelper {
	private constructor() {}
	private static innerInstance = new PwaApiHelper()

	static get instance() {
		return this.innerInstance
	}

	/**
	 * Returns true if website is opened as PWA.
	 *
	 * It's based on best-effort strategy.
	 */
	isRunningPwa = () =>
		typeof window !== "undefined" &&
		typeof window.navigator !== undefined &&
		"serviceWorker" in navigator && // SW support must be here
		((typeof window !== "undefined" &&
			typeof window.matchMedia !== "undefined" &&
			window.matchMedia("(display-mode: standalone)").matches) ||
			(typeof window !== "undefined" &&
				typeof window.navigator !== "undefined" &&
				"standalone" in window.navigator &&
				(window.navigator as any).standalone) ||
			(typeof window.document !== "undefined" &&
				typeof window.document.referrer !== "undefined" &&
				document.referrer.includes("android-app://"))) // this allows detecting TWA
}
