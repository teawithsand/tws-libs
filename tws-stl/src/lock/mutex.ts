import { latePromise } from "../lang"
import { AbortableLockRequest, Lock, LockAdapter } from "./lock"

/**
 * Single JS context-spanning lock, which is just like simple mutex, but on promises.
 */
export class MutexLockAdapter implements LockAdapter {
	private currentPromise: Promise<void> | null = null

	lock = async (): Promise<() => void> => {
		while (this.currentPromise !== null) {
			await this.currentPromise
		}

		const [newPromise, resolve] = latePromise<void>()
		this.currentPromise = newPromise
		return () => {
			this.currentPromise = null
			resolve()
		}
	}

	/*
	tryLock = async (timeoutMs?: number) => {
		timeoutMs = timeoutMs ?? 0

		if (timeoutMs === 0 && this.currentPromise) return null

		let racerDone = false
		let timeout: any = null
		const racer = new Promise<void>(
			(resolve) =>
				(timeout = setTimeout(() => {
					racerDone = true
					if (timeout !== null) {
						clearTimeout(timeout)
						timeout = null
					}
					resolve()
				}, timeoutMs))
		)

		try {
			while (!racerDone) {
				await Promise.race([this.currentPromise, racer])

				if (this.currentPromise === null) {
					const [newPromise, resolve] = latePromise<void>()
					this.currentPromise = newPromise

					return () => {
						this.currentPromise = null
						resolve()
					}
				}
			}
		} finally {
			if (timeout !== null) {
				clearTimeout(timeout)
				timeout = null
			}
		}

		return null
	}*/

	lockAbortable = (): AbortableLockRequest => {
		if (!this.currentPromise) {
			const [newPromise, resolve] = latePromise<void>()
			this.currentPromise = newPromise
			return {
				promise: Promise.resolve(() => {
					this.currentPromise = null
					resolve()
				}),
				abort: () => {},
				aborted: false,
				isAborted: () => false,
			}
		}
		let aborted = false

		const [cancelled, resolveCanclled] = latePromise<void>()

		const cancellableLock = async () => {
			while (!aborted) {
				await Promise.race([this.currentPromise, cancelled])

				if (this.currentPromise === null && !aborted) {
					const [newPromise, resolve] = latePromise<void>()
					this.currentPromise = newPromise

					return () => {
						this.currentPromise = null
						resolve()
					}
				}
			}

			return null
		}
		return {
			promise: cancellableLock(),
			abort: () => {
				aborted = true
				resolveCanclled()
			},
			get aborted() {
				return aborted
			},
			isAborted: () => aborted,
		}
	}
}
