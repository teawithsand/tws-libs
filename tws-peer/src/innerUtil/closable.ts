import { Subscribable } from "@teawithsand/tws-stl"

/**
 * Helper type, which is Subscribable that may be closed.
 */
export type ClosableSubscribable<T> = Subscribable<T> & {
	close: () => void
}
