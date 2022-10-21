import { StickySubscribable, Subscribable } from "@teawithsand/tws-stl"
import { useCallback, useEffect, useState } from "react"

export const useSubscribable = <T>(
	subscribable: Subscribable<T>,
	initialValue: T
): T => {
	const [aggregate, setAggregate] = useState(() => initialValue)

	useEffect(() => {
		const releaser = subscribable.addSubscriber((event) => {
			setAggregate(event)
		})

		return () => {
			releaser()
		}
	}, [subscribable])

	return aggregate
}

export const useSubscribableSelector = <T, E>(
	subscribable: Subscribable<T>,
	selector: (data: T) => E,
	initialValue: E
): E => {
	const [aggregate, setAggregate] = useState(() => initialValue)

	useEffect(() => {
		const releaser = subscribable.addSubscriber((event) => {
			setAggregate(selector(event))
		})

		return () => {
			releaser()
		}
	}, [subscribable])

	return aggregate
}

/**
 * Note: each time callback is changed, listener is re-triggered.
 * This may cause problems with sticky event bus as well as performance problems in general.
 * [useCallback] on callbacks passed here.
 *
 * @see useCallback
 */
export const useSubscribableCallback = <T>(
	subscribable: Subscribable<T>,
	callback: (event: T) => void
) => {
	useEffect(() => {
		const releaser = subscribable.addSubscriber((event) => {
			callback(event)
		})

		return () => {
			releaser()
		}
	}, [subscribable, callback])
}

export const useStickySubscribable = <T>(
	subscribable: StickySubscribable<T>
): T => {
	const [lastEvent, setLastEvent] = useState(subscribable.lastEvent)
	useEffect(() => {
		setLastEvent(subscribable.lastEvent)
		const releaser = subscribable.addSubscriber((event) => {
			setLastEvent(event)
		})

		return () => {
			releaser()
		}
	}, [subscribable])

	return lastEvent
}

export const useStickySubscribableSelector = <T, E>(
	subscribable: StickySubscribable<T>,
	selector: (data: T) => E
): E => {
	const [lastEvent, setLastEvent] = useState(selector(subscribable.lastEvent))
	useEffect(() => {
		setLastEvent(selector(subscribable.lastEvent))
		const releaser = subscribable.addSubscriber((event) => {
			setLastEvent(selector(event))
		})

		return () => {
			releaser()
		}
	}, [subscribable])

	return lastEvent
}
