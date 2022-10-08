/**
 * Type capable of returning human readable error message of type R for any error.
 */
export type ErrorExplainerAdapter<R> = (e: any) => R

export class ErrorExplainer<R> {
	constructor(public readonly adapter: ErrorExplainerAdapter<R>) {}

	explain = (e: any): R => this.adapter(e)

	explainPromiseThrow = async <T>(promise: Promise<T>): Promise<T> => {
		try {
			return await promise
		} catch (e) {
			throw this.adapter(e)
		}
	}

	explainPromise = async <T>(
		promise: Promise<T>
	): Promise<ErrorExplainedPromiseResult<T, R>> => {
		try {
			const v = await promise
			return {
				type: "success",
				value: v,
			}
		} catch (e) {
			return {
				type: "error",
				innerError: e,
				explainedError: this.adapter(e),
			}
		}
	}
}

/**
 * Type of result of promise, which is returned once makeTypedPromiseExplainer was called on promise.
 */
export type ErrorExplainedPromiseResult<T, R> =
	| {
			type: "success"
			value: T
	  }
	| {
			type: "error"
			innerError: any
			explainedError: R
	  }
