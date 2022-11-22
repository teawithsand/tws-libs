export type Subscriber<S> = (state: S, canceler: SubscriptionCanceler) => void
export type DeltaSubscriber<S> = (previousState: S, newState: S) => void
export type Extractor<S, E> = (state: S) => E
export type SubscriptionCanceler = () => void

export interface StickySubscribable<T> extends Subscribable<T> {
	readonly lastEvent: T
}

export interface Subscribable<T> {
	addSubscriber(subscriber: Subscriber<T>): SubscriptionCanceler
}

export interface Emitter<T> {
	emitEvent(e: T): void
}