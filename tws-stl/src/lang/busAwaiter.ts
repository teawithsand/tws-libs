import { Subscribable, SubscriptionCanceler } from "../eventBus"
import { latePromise } from "./latePromise"
import { Queue } from "./queue"

export class BusAwaiter<T> {
	private readonly canceller: SubscriptionCanceler
	private readonly latePromiseQueue: Queue<(e: T) => void> = new Queue()
	private readonly eventQueue: Queue<T> = new Queue()
	private innerIsClosed = false

	get isClosed() {
		return this.innerIsClosed
	}

	constructor(bus: Subscribable<T>) {
		this.canceller = bus.addSubscriber((event) => {
			const latePromise = this.latePromiseQueue.pop()
			if (latePromise) {
				latePromise(event)
			} else {
				this.eventQueue.push(event)
			}
		})
	}

	readEvent = (): Promise<T> => {
		if (this.innerIsClosed) throw new Error("Already closed")

		const event = this.eventQueue.pop()
		if (event) return Promise.resolve(event)

		const [lp, resolve] = latePromise<T>()
		this.latePromiseQueue.push(resolve)

		return lp
	}

	close = () => {
		if (this.innerIsClosed) return
		this.innerIsClosed = true

		while (this.eventQueue.pop()) {}
		while (this.latePromiseQueue.pop()) {}
		this.canceller()
	}
}
