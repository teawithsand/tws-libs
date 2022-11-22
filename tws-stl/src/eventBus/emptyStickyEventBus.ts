import { DefaultEventBus, EventBus } from "./eventBus"
import {
	StickySubscribable,
	Subscribable,
	Subscriber,
	SubscriptionCanceler,
} from "./subscribable"

/**
 * StickyEventBus, which may be empty. In that case it does not trigger event listeners.
 */
export class EmptyStickyEventBus<T>
	implements EventBus<T>, Subscribable<T>, StickySubscribable<T | undefined>
{
	private readonly innerBus = new DefaultEventBus<T>()
	private isEmpty: boolean = true

	private innerLastEvent: T | undefined = undefined

	constructor() {}

	get lastEvent(): T | undefined {
		return this.innerLastEvent
	}

	emitEvent = (event: T) => {
		// Note: this behavior must be as-is
		// before invocation of handler, last event must be updated
		if (event !== undefined) {
			this.innerLastEvent = event
			this.isEmpty = false

			this.innerBus.emitEvent(event)
		}
	}

	addSubscriber = (
		subscriber: Subscriber<T>,
		emitLastEventToNewSubscriber = true
	): SubscriptionCanceler => {
		const canceler = this.innerBus.addSubscriber(subscriber)
		if (!this.isEmpty && emitLastEventToNewSubscriber) {
			subscriber(this.lastEvent as T, canceler)
		}
		return canceler
	}
}
