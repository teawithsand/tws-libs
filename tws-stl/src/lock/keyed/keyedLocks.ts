import { Lock, LockAdapter, RWLock, RWLockAdapter } from ".."

export interface KeyedLockOptions {
	mode: "exclusive" | "shared"
}

export interface KeyedRWLockOptions {
	// none for now
}

export interface KeyedLocksFactory {
	getLockAdapter(key: string, options: KeyedLockOptions): LockAdapter
	getRWLockAdapter(key: string, options: KeyedRWLockOptions): RWLockAdapter
}

// TODO(teawithsand): make it interface and create new ABC with getLock and getRWLock methods
export abstract class KeyedLocks {
	abstract getLockAdapter(key: string, options: KeyedLockOptions): LockAdapter
	abstract getRWLockAdapter(
		key: string,
		options: KeyedRWLockOptions
	): RWLockAdapter

	getLock = (key: string, options: KeyedLockOptions): Lock =>
		new Lock(this.getLockAdapter(key, options))
	getRWLock = (key: string, options: KeyedRWLockOptions): RWLock =>
		new RWLock(this.getRWLockAdapter(key, options))
}
