import { latePromise } from "@teawithsand/tws-stl"
import { createContext, useContext } from "react"
import { SuspenseWrappedPromise, suspenseWrapPromise } from "./wrap"

/**
 * Since useRef and useState are reset each time suspense throw occurs in component, external storage is needed.
 * This is component that provides such storage.
 *
 * You probably do not want to use it. It was designed to work with `usePromiseSuspense` hook.
 */
export interface SuspensePromiseStorage {
	getPromiseClaim: <T>(promise: Promise<T>) => SuspensePromiseStorageClaim<T>
}

/**
 * Claim for single promise stored in `SuspensePromiseStorage`.
 */
export interface SuspensePromiseStorageClaim<T> {
	wrapped: SuspenseWrappedPromise<T>
	activate: () => void
	close: () => void
}

/**
 * Default implementation of SuspensePromiseStorage.
 * Identifies promises equality by however ES6 Map does that.
 */
export class DefaultSuspensePromiseStorage implements SuspensePromiseStorage {
	private readonly map: Map<
		Promise<any>,
		{
			wrapped: SuspenseWrappedPromise<any>
			counter: number
		}
	> = new Map()

	getPromiseClaim = <T>(
		promise: Promise<T>
	): SuspensePromiseStorageClaim<T> => {
		// Some side note here:
		// this implementation is rather bad, as it works with useEffect in order to figure out when promise has changed.
		//
		// A few thins have to happen:
		// 1. (during render): promise is either registered or loaded from registry
		// 2. (during use effect enter): counter is incremented via activate
		// 3. (during use effect cleanup): counter is decremented via close
		//
		// Now imagine following scenario with components A and B(or two instances of same components; does not really matter):
		//
		// 1. A registers and activates promise X.
		// 2. B enters to step 1 of above list.
		// 3. A runs close step, counter hits zero and B is left with it's own version of promise wrapper.
		// 4. B operates under the assumption that wrapper for promise is in map, while this assumption is false since A removed it.
		// 5. For some unrelated reason, rendering of B is triggered and we have to wait for suspenseWrapPromise to wrap
		// the very same promise promise, register it in map, notify suspense parent that it was done and give us the value returned.
		// This may cause unmounting DOM for a short while when suspense's fallback kicks in. Hence calling it suboptimal.
		//
		// This can potentially lead to bugs, although I am not sure. I haven't come up with any scenario yet.
		// Note: it can be solved by making sure that each component has it's own storage, which is not what we want.
		//
		// For this reason I've used simplest, though suboptimal solution: the `this.map.get(promise) === res` check during close.
		// It makes sure that we do not remove wrapper that we do not own.
		//
		// Given that check following statement is true(Although it may have been true even without it. I am not sure):
		// Either we are using shared wrapper version with counter >= 0, that we are required to cleanup
		// or we are the only owner of wrapper, so in that case it's not in map and does not require removing it from there.
		// GC will just collect it and we'll be fine.
		//
		// The "suboptimal" I talk about above is the fact that in some rare cases potentially components may not
		// share the same loading wrapper, even though they could.
        //
        // Parallelism is hard I guess, even though JS is single threaded...
        // If only useRef worked with throw *promise value here* syntax...
        // teawithsand

		let initRes = this.map.get(promise)
		let res = initRes ?? {
			counter: 0,
			wrapped: suspenseWrapPromise(promise),
		}

		// This can't be stored in activate, as we have to cache SuspensePromiseWrapper
		// in external, not react-managed storage.
		// useEffect or any other hook wouldn't ever trigger if this was omitted or put in activate
		if (!initRes) {
			this.map.set(promise, res)
		}

		let isActivated = false
		let isClosed = false
		return {
			activate: () => {
				// Please note that activation is not required to use wrapper.
				// Only some of objects returned here will be activated.

				if (isActivated) throw new Error("Hook was already activated")
				isActivated = true
				res.counter++
			},
			close: () => {
				if (!isActivated) throw new Error("Hook was not activated yet")
				if (isClosed) return
				res.counter--
				if (
					res.counter <= 0 &&
					// note: below condition is false if we are the only owner of res, so no map cleanup required.
					// Somebody else did it already.
					this.map.get(promise) === res
				) {
					this.map.delete(promise)
				}
			},
			wrapped: res.wrapped,
		}
	}
}

/**
 * Predefined SuspensePromiseStorage, used as default one if other was not provided by user.
 */
export const GLOBAL_SUSPENSE_PROMISE_STORAGE =
	new DefaultSuspensePromiseStorage()

/**
 * Context that stores SuspensePromiseStorage.
 */
export const SuspensePromiseStorageContext =
	createContext<SuspensePromiseStorage>(GLOBAL_SUSPENSE_PROMISE_STORAGE)

/**
 * Shortcut for `useContext(SuspensePromiseStorageContext)`.
 */
export const useSuspensePromiseStorage = (): SuspensePromiseStorage =>
	useContext(SuspensePromiseStorageContext)
