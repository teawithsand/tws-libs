import { computeMapDimensionsFromBlocks } from "@app/game/map/ops"
import { transposeMatrix } from "@app/util/matrix"

describe("map operations", () => {
	describe("map normalization", () => {
		it("get map dimensions from blocks works ok", () => {
			const res = computeMapDimensionsFromBlocks(
				transposeMatrix([
					[0, -1, -1],
					[-1, -1, -1],
					[-1, 0, -1],
				]),
			)

			expect(res.offsetTop).toStrictEqual(0)
			expect(res.offsetBottom).toStrictEqual(2)
			expect(res.offsetLeft).toStrictEqual(0)
			expect(res.offsetRight).toStrictEqual(1)
			expect(res.width).toStrictEqual(2)
			expect(res.height).toStrictEqual(3)
		})
	})

	it("normalizes map data ok", () => {
		// TODO(teawithsand): implement tests for this case
	})
})
