import { DefaultEventBus } from "./eventBus"
import { Subscriber } from "./subscribable"

const trackingSubscriber = (): [number[], Subscriber<number>] => {
	const arr: number[] = []

	return [arr, (event: number) => arr.push(event)]
}

describe("DefaultEventBus", () => {
	it("emits event to subscribers, which were not canceled", () => {
		const eb = new DefaultEventBus<number>()

		const [eventsOne, trackerOne] = trackingSubscriber()
		const [eventsTwo, trackerTwo] = trackingSubscriber()

		eb.emitEvent(1)
		const cancelOne = eb.addSubscriber(trackerOne)
		eb.emitEvent(2)
		const cancelTwo = eb.addSubscriber(trackerTwo)
		eb.emitEvent(3)
		cancelOne()
		eb.emitEvent(4)
		cancelTwo()
		eb.emitEvent(5)

		expect(eventsOne).toEqual([2, 3])
		expect(eventsTwo).toEqual([3, 4])
	})

	it("can cancel same subscriber many times", () => {
		const eb = new DefaultEventBus<number>()

		const [, trackerOne] = trackingSubscriber()
		eb.emitEvent(1)
		const cancelOne = eb.addSubscriber(trackerOne)
		cancelOne()
		cancelOne()
		cancelOne()
		eb.emitEvent(2)
	})
})
