import {
	Emitter,
	Subscribable,
	Subscriber,
	SubscriptionCanceler,
} from "./subscribable"

export interface EventBus<T> extends Subscribable<T>, Emitter<T> {}

export class DefaultEventBus<T> implements EventBus<T> {
	private subscribers: Subscriber<T>[] = []

	emitEvent = (event: T) => {
		const copy = [...this.subscribers]
		// Can't use forEach without copy here, since .forEach method at least
		// has this weird quirk that causes some elements to be skipped if array gets modified in between calls
		for (const subscriber of copy) {
			subscriber(event, () => {
				this.removeSubscriber(subscriber)
			})
		}
	}

	addSubscriber = (subscriber: Subscriber<T>): SubscriptionCanceler => {
		this.subscribers.push(subscriber)

		return () => this.removeSubscriber(subscriber)
	}

	private removeSubscriber = (subscriber: Subscriber<T>) => {
		const i = this.subscribers.findIndex((e) => e === subscriber)
		if (i < 0) return // warn maybe?
		this.subscribers.splice(i, 1)
	}
}
