import { latePromise } from "../../lang"
import { AbortableLockRequest, LockAdapter, RWLockAdapter } from "../lock"
import { KeyedLockOptions, KeyedLocks } from "./keyedLocks"
import { WebLockEx } from "./webLock"

export class WebKeyedLocks extends KeyedLocks {
	getLockAdapter = (key: string, options: KeyedLockOptions): LockAdapter => {
		const wl = new WebLockEx(key)

		return {
			lock: async () => {
				const [locked, resolveLocked] = latePromise<void>()
				const [done, resolveDone] = latePromise<void>()

				wl.claim({
					exclusive: options.mode === "exclusive",
					opWhenAcquired: async () => {
						resolveLocked()

						await done
					},
				})

				await locked

				return () => resolveDone()
			},
			lockAbortable: (): AbortableLockRequest => {
				let aborted = false

				const abort = new AbortController()

				const lockCancellable = async () => {
					const [locked, resolveLocked] = latePromise<boolean>()
					const [done, resolveDone] = latePromise<void>()

					wl.claim({
						exclusive: options.mode === "exclusive",
						signal: abort.signal,
						opWhenNotAcquired: async () => {
							resolveLocked(false)
						},
						opWhenAcquired: async () => {
							resolveLocked(true)

							await done
						},
					})

					const isLocked = await locked
					if (aborted && isLocked) {
						// we aborted, but locked
						// but abort was first, so just release lock
						resolveDone()
					} else if (isLocked) {
						return () => resolveDone()
					}

					return null
				}

				return {
					promise: lockCancellable(),
					abort: () => {
						aborted = true
						abort.abort()
					},
					get aborted() {
						return aborted
					},
					isAborted: () => aborted,
				}
			},
		}
	}

	getRWLockAdapter = (key: string): RWLockAdapter => {
		return {
			read: this.getLockAdapter(key, { mode: "shared" }),
			write: this.getLockAdapter(key, { mode: "exclusive" }),
		}
	}
}

/**
 * In fact, web keyed locks under the hood is singleton, so this is fine.
 */
export const GLOBAL_WEB_KEYED_LOCKS = new WebKeyedLocks()
