import { ErrorExplainer, ErrorExplainerAdapter } from "./explainer"

type ErrorExplainerBuilderEntry<R> = (e: any) => {
	result: R
} | null

interface ClazzConstructor<T> {
	new (): T
}

export class ErrorExplainerBuilder<R extends {}> {
	/**
	 *
	 * @param fallback Adapter responsible for returning unknown error or something like that.
	 */
	constructor(private readonly fallback: ErrorExplainerAdapter<R>) {}
	private entries: ErrorExplainerBuilderEntry<R>[] = []

	addClassAdapter = <T>(
		clazz: ClazzConstructor<T>,
		explainer: ErrorExplainerAdapter<R>
	) => {
		this.entries.push((e) => {
			if (e instanceof clazz) {
				return {
					result: explainer(e as T),
				}
			} else {
				return null
			}
		})

        return this
	}

	addMatcherAdapter = <T>(
		matches: (e: T) => boolean,
		explainer: ErrorExplainerAdapter<R>
	) => {
		this.entries.push((e) => {
			if (matches(e)) {
				return {
					result: explainer(e),
				}
			} else {
				return null
			}
		})

        return this
	}

	private addNonNullFn = (
		explainer: ErrorExplainerAdapter<R | null | undefined>
	) => {
		this.entries.push((e) => {
			const result = explainer(e)
			if (result !== undefined && result !== null) {
				return { result }
			} else {
				return null
			}
		})
	}

	addNonNullAdapter = (
		adapter: ErrorExplainerAdapter<R | null | undefined>
	) => {
		this.addNonNullFn(adapter)
        
        return this
	}

	addNonNullExplainerAdapter = (
		explainer: ErrorExplainer<R | null | undefined>
	) => {
		this.addNonNullFn(explainer.adapter)

        return this
	}

	addNonNullClassAdapter = <T>(
		clazz: ClazzConstructor<T>,
		explainer: ErrorExplainerAdapter<R | null | undefined>
	) => {
		this.entries.push((e) => {
			if (e instanceof clazz) {
				const result = explainer(e as T)
				if (result !== null && result !== undefined) {
					return {
						result,
					}
				}
			}

			return null
		})

        return this
	}

	buildAdapter = (): ErrorExplainerAdapter<R> => {
		const entries = [...this.entries]
		const fallback = this.fallback

		return (err) => {
			for (const entry of entries) {
				const res = entry(err)
				if (res !== null) {
					return res.result
				}
			}

			return fallback(err)
		}
	}

	build = (): ErrorExplainer<R> => new ErrorExplainer(this.buildAdapter())
}
