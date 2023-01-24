import { Subscribable, SubscriptionCanceler } from "../eventBus"
import { latePromise } from "./latePromise"
import { Queue } from "./queue"

/**
 * Creates promise that awaits single event from bus it's given.
 */
export const busAwaitSingleEvent = async <T>(
	bus: Subscribable<T>
): Promise<T> => {
	const [p, resolve] = latePromise<T>()
	bus.addSubscriber((s, canceller) => {
		resolve(s)
		canceller()
	})

	return p
}

export class BusAwaiter<T> {
	private readonly canceller: SubscriptionCanceler
	private readonly latePromiseQueue: Queue<
		[(e: T) => void, (e: any) => void]
	> = new Queue()
	private readonly eventQueue: Queue<T> = new Queue()
	private innerIsClosed = false

	get isClosed() {
		return this.innerIsClosed
	}

	constructor(bus: Subscribable<T>) {
		this.canceller = bus.addSubscriber((event) => {
			const arr = this.latePromiseQueue.pop()
			if (arr) {
				const [resolve] = arr
				resolve(event)
			} else {
				this.eventQueue.push(event)
			}
		})
	}

	get eventQueueSize(): number {
		return this.eventQueue.length
	}

	get listenerQueueSize(): number {
		return this.latePromiseQueue.length
	}

	/**
	 * Returns event if one was already enqueued and drops it from queue.
	 * Returns null otherwise.
	 *
	 * Always returns as fast as possible.
	 *
	 * Note: running it in infinite loop will cause that loop to never end, as it does not allow
	 * JS fiber switching, so that another fiber may enqueue that event.
	 */
	popEvent = (): T | null => {
		return this.eventQueue.pop()
	}

	readEvent = (): Promise<T> => {
		if (this.innerIsClosed)
			return Promise.reject(new Error("Already closed"))

		const event = this.eventQueue.pop()
		if (event) return Promise.resolve(event)

		const [lp, resolve, reject] = latePromise<T>()
		this.latePromiseQueue.push([resolve, reject])

		return lp
	}

	close = () => {
		if (this.innerIsClosed) return
		this.innerIsClosed = true

		while (this.eventQueue.pop()) {}
		for (;;) {
			const v = this.latePromiseQueue.pop()
			if (!v) break
			const [_resolve, reject] = v
			reject(new Error("Already closed"))
		}
		this.canceller()
	}
}
