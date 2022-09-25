import { latePromise } from "../latePromise"

export class AssertCondition {
	public readonly promise: Promise<void>

	private reject: (e: any) => void
	private resolve: () => void
	constructor(private readonly name: string = "") {
		const [promise, resolve, reject] = latePromise<void>()
		this.promise = promise
		this.reject = reject
		this.resolve = resolve
	}
	private fulfilled = false

	setFulfilled() {
		if (!this.fulfilled) {
			this.resolve()
		}
		this.fulfilled = true
	}

	assert = () => {
		if (!this.fulfilled) {
			const err = new Error(this.name || "Condition not fulfilled")
			this.reject(err)
			throw err
		}
	}
}
