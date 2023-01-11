import React, {
	createContext,
	ReactFragment,
	useContext,
	useEffect,
	useState,
} from "react"
import { Counter } from "./types"

export * from "./types"

const getGoatCounter = (): Counter | null => {
	if (typeof window !== "undefined" && "goatcounter" in window) {
		return (window.goatcounter as any).count as Counter
	}
	return null
}

const CounterContext = createContext<Counter | null>(null)

/**
 * Provides goatcounter counter, if counter is not set.
 * Otherwise provides specified counter.
 */
export const ProvideCounter = (props: {
	children?: ReactFragment
	counter?: Counter
}) => {
	const { children, counter } = props

	const [ctr, setCtr] = useState<Counter | null>(null)
	useEffect(() => {
		if (counter) {
			setCtr(counter)
		} else {
			const immediateCounter = getGoatCounter()
			// quick SSR check. On SSR do not return non-noop value.
			if (typeof window !== "undefined" && window.document) {
				if (immediateCounter) {
					// Do not wait if already loaded.
					setCtr(immediateCounter)
				} else {
					// Method's rudimentary and suboptimal, but will work.
					const handle = setInterval(() => {
						clearInterval(handle)

						setCtr(getGoatCounter())
					}, 200)

					return () => {
						clearInterval(handle)
					}
				}
			}
		}

		return () => {}
	}, [counter])

	return (
		<CounterContext.Provider value={ctr}>
			{children}
		</CounterContext.Provider>
	)
}

/**
 * Uses provided counter or noop one if none is provided.
 */
export const useCounter = (): Counter => {
	return useContext(CounterContext) ?? (() => undefined)
}

/**
 * Uses provided counter or null if none is loaded.
 */
export const useCounterIfLoaded = (): Counter | null => {
	return useContext(CounterContext) ?? null
}

/**
 * Can be called in parent layout component(when no_load option is set in goatcounter config),
 * in order to do page counting when this parameter changes.
 *
 * It's most useful when used with `gatsby-plugin-layout` like this:
 * ```javascript
 * import { doCountPath } from "@teawithsand/tws-goatcounter-gatsby-plugin"
 * import React, { ReactFragment } from "react"
 *
 * export const InnerLayout = (props: {
 * 		children?: ReactFragment
 * 		path: string
 * }) => {
 * 		doCountPath(props.path)
 * 		return <>{props.children}</>
 * }
 * ```
 *
 * It can also be triggered in any page component just like it was shown above.
 */
export const doCountPath = (path: string) => {
	const counter = useCounter()

	useEffect(() => {
		counter({ path })
	}, [counter, path])
}
