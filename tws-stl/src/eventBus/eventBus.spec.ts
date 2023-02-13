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

	it("can cancel subscriber during iteration", () => {
		const eb = new DefaultEventBus<number>()

		const [value, trackerOne] = trackingSubscriber()
		eb.addSubscriber((ev, cancel) => {
			cancel()
			trackerOne(ev, cancel)
		})
		eb.emitEvent(1)
		eb.emitEvent(2)
		eb.emitEvent(3)

		expect(value).toEqual([1])
	})

	it("can cancel subscriber during iteration without distrubing other subscribers", () => {
		const eb = new DefaultEventBus<number>()

		const [value, tracker] = trackingSubscriber()
		const pre = [...new Array(5).keys()].map(() => trackingSubscriber())
		const post = [...new Array(5).keys()].map(() => trackingSubscriber())

		pre.forEach(([, s]) => eb.addSubscriber(s))
		eb.addSubscriber((ev, cancel) => {
			cancel()
			tracker(ev, cancel)
		})
		post.forEach(([, s]) => eb.addSubscriber(s))

		eb.emitEvent(1)
		eb.emitEvent(2)
		eb.emitEvent(3)

		const preValues = pre.map((v) => v[0])
		const postValues = post.map((v) => v[0])

		expect(value).toEqual([1])
		expect(preValues).toEqual(new Array(5).fill([1, 2, 3]))
		expect(postValues).toEqual(new Array(5).fill([1, 2, 3]))
	})
})
