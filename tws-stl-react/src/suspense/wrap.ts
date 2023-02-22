
export type SuspenseWrappedPromise<T> = {
	originalPromise: Promise<T>
	get: () => T
}

/**
 * Wraps promise so, it can be used from suspense.
 *
 * It should be called OUTSIDE of render method or in some controlled way, like in useEffect.
 * Function returned, should be called INSIDE render method of component.
 */
export const suspenseWrapPromise = <T>(
	promise: Promise<T>
): SuspenseWrappedPromise<T> => {
	let status = 0
	let response: T
	let error: any = null

	const renderOnDonePromise = promise.then(
		(res) => {
			status = 1
			response = res
		},
		(err) => {
			status = -1
			error = err
		}
	)

	return {
		originalPromise: promise,
		get: () => {
			if (status === 0) {
				throw renderOnDonePromise.catch(() => {
					// noop
				})
			} else if (status === -1) {
				throw error
			} else {
				return response
			}
		},
	}
}