import { DependencyList, useEffect, useState } from "react"

/**
 * Use memo, that works for ssr-unsafe callbacks.
 *
 * Requires user to provide value that has to be returned if no ssr is available.
 */
export const ssrUseMemo = <T>(
	ssrFallback: T,
	callback: () => T,
	deps: DependencyList | undefined
) => {
	const [value, setValue] = useState(ssrFallback)

	useEffect(() => {
		setValue(callback())
	}, deps)

	return value
}
