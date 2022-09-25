import { AssertCondition, simpleSleep } from "@teawithsand/tws-stl"
import { SleepEventType, SleepHelper } from "."

describe("SleepHelper", () => {
	let sh: SleepHelper
	beforeEach(() => {
		sh = new SleepHelper()
	})
	afterEach(() => {
		// release any timers, which may have been running after test
		sh.setSleep(null)
	})

	it("triggers start event", async () => {
		const cond = new AssertCondition("Sleep started")
		sh.sleepEventBus.addSubscriber((e) => {
			if (e.type === SleepEventType.SLEEP_BEGIN) {
				cond.setFulfilled()
			}
		})
		sh.setSleep({
			mainDurationMillis: 100,
		})

		await cond.promise
	})

	it("triggers canceled event", async () => {
		const cond = new AssertCondition("Sleep finished")
		sh.sleepEventBus.addSubscriber((e) => {
			if (e.type === SleepEventType.SLEEP_CANCEL) {
				cond.setFulfilled()
			}
		})
		sh.setSleep({
			mainDurationMillis: 100,
		})
		sh.setSleep(null)
		await cond.promise
	})

	describe("with no volume", () => {
		it("triggers done event", async () => {
			const cond = new AssertCondition("Sleep finished")
			sh.sleepEventBus.addSubscriber((e) => {
				if (e.type === SleepEventType.SLEEP_FINISHED) {
					cond.setFulfilled()
				}
			})
			sh.setSleep({
				mainDurationMillis: 100,
			})

			await cond.promise
		})

		it("does not trigger canceled event when done", async () => {
			sh.sleepEventBus.addSubscriber((e) => {
				if (e.type === SleepEventType.SLEEP_CANCEL) {
					throw new Error("Unreachable code")
				}
			})
			sh.setSleep({
				mainDurationMillis: 100,
			})

			await simpleSleep(150)
		})
	})

	describe("with volume", () => {
		it("triggers done event", async () => {
			const cond = new AssertCondition("Sleep finished")
			sh.sleepEventBus.addSubscriber((e) => {
				if (e.type === SleepEventType.SLEEP_FINISHED) {
					cond.setFulfilled()
				}
			})
			sh.setSleep({
				mainDurationMillis: 100,
			})

			await cond.promise
		})

		it("does not trigger canceled event when done", async () => {
			sh.sleepEventBus.addSubscriber((e) => {
				if (e.type === SleepEventType.SLEEP_CANCEL) {
					throw new Error("Unreachable code")
				}
			})
			sh.setSleep({
				mainDurationMillis: 100,
			})

			await simpleSleep(150)
		})

		it("triggers volume fall event", async () => {
			const cond = new AssertCondition("Volume turndown pending")
			sh.sleepEventBus.addSubscriber((e) => {
				if (e.type === SleepEventType.SLEEP_VOLUME_TURN_PROGRESS) {
					cond.setFulfilled()
				}
			})
			sh.setSleep({
				mainDurationMillis: 100,
				volumeDownDurationMillis: 200,
			})

			await cond.promise
		})
	})
})
