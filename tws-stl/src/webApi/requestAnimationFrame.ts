import { DefaultEventBus, Subscribable } from "../eventBus"
import { PerformanceTimestampMs } from "../lang"

export type RequestAnimationFrameData = {
	timestamp: PerformanceTimestampMs
}

/**
 * Manages multiple calls to window.requestAnimationFrame via single bus,
 * so it works as expected with many renderers.
 */
export class RequestAnimationFrameApiHelper {
	private constructor() {}
	private static innerInstance = new RequestAnimationFrameApiHelper()
	private readonly innerBus = new DefaultEventBus<RequestAnimationFrameData>()

	private isEnabled = false
	private lastRequestId: number | null = null
	public static get instance() {
		return this.innerInstance
	}

	get isSupported() {
		return (
			typeof window !== "undefined" &&
			typeof window.navigator !== "undefined" &&
			"requestAnimationFrame" in window
		)
	}

	get bus(): Subscribable<RequestAnimationFrameData> {
		return this.innerBus
	}

	private disable = () => {
		if (this.lastRequestId !== null) {
			window.cancelAnimationFrame(this.lastRequestId)
			this.lastRequestId = null
		}
	}

	private enable = () => {
		const cb = (timestamp: number) => {
			if (!this.isEnabled) return

			this.innerBus.emitEvent({
				timestamp: timestamp as PerformanceTimestampMs,
			})
			this.lastRequestId = window.requestAnimationFrame(cb)
		}

		this.lastRequestId = window.requestAnimationFrame(cb)
	}

	setEnabled = (isEnabled: boolean) => {
		const isOutOfSync = isEnabled !== this.isEnabled
		this.isEnabled = isEnabled
		if (isOutOfSync) {
			if (!isEnabled) {
				this.disable()
			} else {
				this.enable()
			}
		}
	}
}
