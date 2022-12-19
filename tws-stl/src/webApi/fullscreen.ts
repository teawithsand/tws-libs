import { DefaultStickyEventBus, StickySubscribable } from "../eventBus"

export enum FullscreenEventType {
	DISABLED = 0,
	ENABLED = 1,
}

export type FullscreenEvent =
	| {
			type: FullscreenEventType.ENABLED
	  }
	| {
			type: FullscreenEventType.DISABLED
	  }

export class FullscreenApiHelper {
	private readonly innerBus = new DefaultStickyEventBus<FullscreenEvent>({
		type: this.isFullscreen
			? FullscreenEventType.ENABLED
			: FullscreenEventType.DISABLED,
	})

	get bus(): StickySubscribable<FullscreenEvent> {
		return this.innerBus
	}

	private constructor() {
		if (this.isSupported) {
			window.addEventListener("fullscreenchange", () => {
				this.innerBus.emitEvent({
					type: this.isFullscreen
						? FullscreenEventType.ENABLED
						: FullscreenEventType.DISABLED,
				})
			})
		}
	}
	private static innerInstance = new FullscreenApiHelper()

	public static get instance() {
		return this.innerInstance
	}

	get isSupported(): boolean {
		return (
			typeof document !== "undefined" &&
			(typeof document.exitFullscreen !== "undefined" ||
				typeof document.fullscreenElement !== "undefined")
		)
	}

	get isFullscreen(): boolean {
		return this.isSupported && !!document.fullscreenElement
	}

	exitFullscreen = async () => {
		await document.exitFullscreen()
	}

	/**
	 * Requests fullscreen either on entire document or specified html element.
	 */
	requestFullscreen = async (
		e: Element = document.documentElement,
		options?: FullscreenOptions
	): Promise<void> => {
		await e.requestFullscreen(options)
	}
}
