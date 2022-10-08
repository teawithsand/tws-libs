import { MutableRefObject, useRef } from "react"

/**
 * Optimization hook, which takes non-ref value and makes it ref.
 */
export const useAsRef = <T>(data: T): MutableRefObject<T> => {
	const res = useRef<T>()
	res.current = data
	return res as MutableRefObject<T>
}
