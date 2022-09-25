import { simpleSleep } from "../lang"
import { Lock } from "./lock"
import { MutexLockAdapter } from "./mutex"

describe("SimpleLock", () => {
	it("does what locks are supposed to do - locks that is", async () => {
		const lock = new Lock(new MutexLockAdapter())

		let isTaskRunning = false
		const promises = []
		for (let i = 0; i < 30; i++) {
			const t = async () => {
				const unlock = await lock.lock()
				try {
					expect(isTaskRunning).toBe(false)
					isTaskRunning = true
					await simpleSleep(50 + Math.random() * 10)
				} finally {
					isTaskRunning = false
					unlock()
				}
			}

			promises.push(t())
		}

		await Promise.all(promises)
	})
})
