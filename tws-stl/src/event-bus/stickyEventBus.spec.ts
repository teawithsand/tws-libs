import { DefaultStickyEventBus } from "./stickyEventBus"
import { Subscriber } from "./subscribable"

const trackingSubscriber = (): [number[], Subscriber<number>] => {
	const arr: number[] = []

	return [arr, (event: number) => arr.push(event)]
}

describe("DefaultStickyEventBus", () => {
	it("emits event to subscribers, which were not canceled", () => {
		const eb = new DefaultStickyEventBus<number>(0)

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

		expect(eventsOne).toEqual([1, 2, 3])
		expect(eventsTwo).toEqual([2, 3, 4])
	})

	it("can cancel same subscriber many times", () => {
		const eb = new DefaultStickyEventBus<number>(0)

		const [, trackerOne] = trackingSubscriber()
		eb.emitEvent(1)
		const cancelOne = eb.addSubscriber(trackerOne)
		cancelOne()
		cancelOne()
		cancelOne()
		eb.emitEvent(2)
	})

	it("keeps track of last event outside subscriber", () => {
		const eb = new DefaultStickyEventBus<number>(0)

		expect(eb.lastEvent).toEqual(0)
		eb.emitEvent(1)
		expect(eb.lastEvent).toEqual(1)
	})

	it("keeps track of last event inside subscriber", () => {
		const eb = new DefaultStickyEventBus<number>(0)

		eb.addSubscriber(e => {
			expect(eb.lastEvent).toEqual(e)
		})

		eb.emitEvent(1)
	})
})
