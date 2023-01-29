/**
 * Simple queue, which uses JS's holey arrays in order to provide user with queue.
 * 
 * It may be slow on large items count.
 */
export class Queue<T> {
	private inner: T[] = []

	get array(): T[] {
		return [...this.inner]
	}

	peek = (): T | null => {
		if (this.inner.length > 0) return this.inner[0]
		return null
	}

	get length() {
		return this.inner.length
	}

	get isEmpty() {
		return this.length === 0
	}

	clear = () => {
		this.inner = []
	}

	append = (v: T) => {
		this.inner.push(v)
	}

	/**
	 * @deprecated Use append instead as it's more queue-like function.
	 */
	push = (v: T) => {
		this.inner.push(v)
	}

	pop = (): T | null => {
		if (this.inner.length === 0) return null
		const v = this.inner[0]
		this.inner.splice(0, 1)
		return v
	}
}
