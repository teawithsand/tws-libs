import { latePromise } from "./latePromise"

/**
 * Warning: leaks promises, if user drops them without waiting for them.
 */
export const simpleSleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Sleep, which can be canceled.
 * Cancel causes promise to reject with error immediately.
 * 
 * Unlike simpleSleep does not leak promises.
 */
export const sleep = (ms: number): [Promise<void>, () => void] => {
	const [p, _, reject] = latePromise<void>()

	let resolved = false
	const timeout = setTimeout(() => {
		resolved = true
		reject(new Error("Sleep was cancelled"))
	}, ms)

	return [
		p,
		() => {
			if (!resolved) {
				clearTimeout(timeout)
			}
			resolved = true
		},
	]
}
