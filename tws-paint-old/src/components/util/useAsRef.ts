import { MutableRefObject, useRef } from "react"

/**
 * Optimization hook, which takes non-ref value and makes it ref.
 * Efficiently, it makes it mutable across all rendered component instances
 */
export const useAsRef = <T>(data: T): MutableRefObject<T> => {
	const res = useRef<T>()
	res.current = data
	return res as MutableRefObject<T>
}
