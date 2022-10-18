import { SpatialHashMap } from "@app/util/ds/spatialMap"
import { Rect, RectLike } from "@app/util/geometry"

describe("SpatialMap", () => {
	it("properly returns included items", () => {
		const m = new SpatialHashMap<number>(2, 2)
		m.newClient(
			1,
			new Rect([
				[0, 0],
				[10, 10],
			]),
		)

		m.newClient(
			2,
			new Rect([
				[10, 10],
				[10, 10],
			]),
		)

		m.newClient(
			3,
			new Rect([
				[33, 33],
				[44, 44],
			]),
		)

		m.newClient(
			4,
			new Rect([
				[10, 10],
				[20, 20],
			]),
		)

		const q = (rl: RectLike | Rect) => m.getIntersectingValues(new Rect(rl))

		expect(
			q([
				[0, 0],
				[0, 0],
			]),
		).toEqual([1])

		expect(
			q([
				[10, 10],
				[10, 10],
			]),
		).toEqual([1, 2, 4])
	})
})