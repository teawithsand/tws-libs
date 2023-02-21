import { DefaultEventBus, Subscribable } from "@teawithsand/tws-stl"

export class IntervalHelper {
	private readonly innerBus = new DefaultEventBus<void>()
	private innerInterval: any | null = null

	get bus(): Subscribable<void> {
		return this.innerBus
	}

	constructor(private delay: number) {
		const storedDelay = delay
		this.delay = -1
		this.setDelay(storedDelay)
	}

	private release = () => {
		if (this.innerInterval) {
			clearInterval(this.innerInterval)
			this.innerInterval = null
		}
	}

	trigger = () => {
		this.innerBus.emitEvent()
	}

	disable = () => this.setDelay(0)

	setDelay = (delay: number, doTrigger = false) => {
		this.delay = delay
		if (delay <= 0 || !isFinite(delay)) {
			this.release()
		} else {
			this.release()

			if (doTrigger) {
				this.trigger()
			}

			this.innerInterval = setInterval(() => this.trigger(), delay)
		}
	}
}