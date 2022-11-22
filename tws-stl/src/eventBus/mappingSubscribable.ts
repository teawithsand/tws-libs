import {
	StickySubscribable,
	Subscribable,
	Subscriber,
	SubscriptionCanceler,
} from "./subscribable"

export class MappingSubscribable<T, E> implements Subscribable<E> {
	constructor(
		private readonly innerSubscribable: Subscribable<T>,
		private readonly converter: (val: T) => E
	) {}

	addSubscriber = (subscriber: Subscriber<E>): SubscriptionCanceler =>
		this.innerSubscribable.addSubscriber((v) => {
			subscriber(this.converter(v))
		})
}

export class MappingStickySubscribable<T, E> implements StickySubscribable<E> {
	constructor(
		private readonly innerSubscribable: StickySubscribable<T>,
		private readonly converter: (val: T) => E
	) {}

	get lastEvent(): E {
		return this.converter(this.innerSubscribable.lastEvent)
	}

	addSubscriber = (subscriber: Subscriber<E>): SubscriptionCanceler =>
		this.innerSubscribable.addSubscriber((v) => {
			subscriber(this.converter(v))
		})
}
