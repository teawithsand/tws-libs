/**
 * Promise, which can be resolved later using external callbacks returned.
 */
 export const latePromise = <T>(): [
	Promise<T>,
	(value: T) => void,
	(e: any) => void,
] => {
	let rejector: null | ((error: any) => void) = null
	let resolver: null | ((value: T) => void) = null

	let isValueSet = false
	let isErrorSet = false
	let value: T = null as any
	const p = new Promise<T>((resolve, reject) => {
		if (isValueSet) {
			resolve(value)
		} else if (isErrorSet) {
			reject(value)
		} else {
			resolver = resolve
			rejector = reject
		}
	})

	return [
		p,
		v => {
			if (resolver != null) resolver(v)
			else {
				isValueSet = true
				value = v
			}
		},
		err => {
			if (rejector != null) rejector(err)
			else {
				isErrorSet = true
				value = err
			}
		},
	]
}
