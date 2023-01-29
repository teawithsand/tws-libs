import { latePromise } from "./latePromise"
import { Queue } from "./queue"
import { throwExpression } from "./throwExpression"

export class AsyncQueueClosedError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "AsyncQueueClosedError"
	}
}

export class AsyncQueue<T> {
	private readonly awaitersQueue = new Queue<{
		resolve: (value: T) => void
		reject: (e: any) => void
	}>()
	private readonly resultQueue = new Queue<T>()
	private closeError: Error = new AsyncQueueClosedError(
		"Async Queue was closed before value to receive was emitted"
	)

	private isClosed = false

	get resultQueueLength(): number {
		return this.resultQueue.length
	}
	get awaiterQueueLength(): number {
		return this.awaitersQueue.length
	}

	/**
	 * Negative, when more people are waiting than there is messages.
	 * Positive if there are messages waiting to be received.
	 * Zero if empty and nobody's waiting.
	 */
	get length(): number {
		return this.resultQueue.length - this.awaiterQueueLength
	}

	append = (value: T) => {
		if (this.isClosed) throw new Error("AsyncQueue was closed")

		const resolver = this.awaitersQueue.pop()
		if (resolver) {
			resolver.resolve(value)
		} else {
			this.resultQueue.append(value)
		}
	}

	/**
	 * Drops all not-yet received values from queue.
	 */
	clear = () => {
		this.resultQueue.clear()
	}

	/**
	 * @deprecated Used only for compatibility with Queue. Use append instead.
	 */
	push = (value: T) => this.append(value)

	pop = (): T | null => this.resultQueue.pop()
	peek = (): T | null => this.resultQueue.peek()

	popAsync = async () => {
		if (this.isClosed)
			throw this.closeError

		if (this.resultQueue.length) {
			return this.resultQueue.pop()
		}

		const [p, resolve, reject] = latePromise<T>()
		this.awaitersQueue.append({ resolve, reject })
		return p
	}

	/**
	 * Closes AsyncQueue so no more data can be pushed/popped to/from it.
	 * 
	 * It may specify error which should be thrown for all append/popAsync calls.
	 */
	close = (error?: Error) => {
		this.isClosed = true
		this.closeError = error ?? this.closeError

		this.resultQueue.clear()

		while (!this.awaitersQueue.isEmpty) {
			const { reject } =
				this.awaitersQueue.pop() ??
				throwExpression(new Error("unreachable code"))

			reject(this.closeError)
		}
	}
}
