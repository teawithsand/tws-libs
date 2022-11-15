import { latePromise } from "../lang"

export type Unlock = () => void

export const NoopLockAdapter: LockAdapter = {
	lock: async () => () => {
		// noop
	},
	lockAbortable: (): AbortableLockRequest => {
		let aborted = false
		return {
			promise: (async () => () => {
				// noop
			})(),
			abort: () => {
				aborted = true
			},
			get aborted() {
				return aborted
			},
			isAborted: () => aborted,
		}
	},
}

export const NoopRWLockAdapter: RWLockAdapter = {
	read: NoopLockAdapter,
	write: NoopLockAdapter,
}

export type AbortableLockRequest = {
	promise: Promise<Unlock | null>
	abort: () => void
	readonly aborted: boolean
	isAborted: () => boolean
}

export type TypedAbortableLockRequest<T> = [
	Promise<T>,
	() => void,
	() => boolean
]

export interface LockAdapter {
	lock(): Promise<Unlock>
	lockAbortable(): AbortableLockRequest
}

export interface RWLockAdapter {
	readonly read: LockAdapter
	readonly write: LockAdapter
}

export class RWLock {
	public readonly readLock: Lock
	public readonly writeLock: Lock

	constructor(public readonly adapter: RWLockAdapter) {
		this.readLock = new Lock(adapter.read)
		this.writeLock = new Lock(adapter.write)
	}

	lockRead = () => this.adapter.read.lock()
	withLockRead = async <T>(cb: () => Promise<T>): Promise<T> => {
		const unlock = await this.lockRead()
		try {
			return await cb()
		} finally {
			unlock()
		}
	}

	lockWrite = () => this.adapter.write.lock()
	withLockWrite = async <T>(cb: () => Promise<T>): Promise<T> => {
		const unlock = await this.lockWrite()
		try {
			return await cb()
		} finally {
			unlock()
		}
	}
}

/**
 * Adapter, which returns same adapter for read and write locks.
 */
export class FakeRWLockAdapter implements RWLockAdapter {
	public readonly read: LockAdapter
	public readonly write: LockAdapter

	constructor(adapter: LockAdapter) {
		this.read = adapter
		this.write = adapter
	}
}

/**
 * Simple wrapper on LockAdapter, which provides additional features and makes using lock adapter simple and less error-prone.
 */
export class Lock {
	constructor(public readonly adapter: LockAdapter) {}

	lock = () => this.adapter.lock()
	lockAbortable = () => this.adapter.lockAbortable()

	withLock = async <T>(cb: () => Promise<T>): Promise<T> => {
		const unlock = await this.lock()
		try {
			return await cb()
		} finally {
			unlock()
		}
	}

	withLockAbortable = <T>(
		cb: (locked: boolean) => Promise<T>
	): TypedAbortableLockRequest<T> => {
		const req = this.lockAbortable()

		return [
			(async () => {
				const unlocker = await req.promise
				if (unlocker) {
					try {
						return await cb(true)
					} finally {
						unlocker()
					}
				} else {
					return await cb(false)
				}
			})(),
			() => {
				req.abort()
			},
			() => {
				return req.aborted
			},
		]
	}
}
