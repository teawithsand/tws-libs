import { latePromise } from "../../lang"
import { LockAdapter, RWLockAdapter } from "../lock"
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
