import { Point } from "@app/util/geometry/point"
import { Rect, RectLike } from "@app/util/geometry/rect"

describe("geometry", () => {
	it("has niy tests", () => {
		// NIY
	})

	describe("rectangle", () => {
		it("contains point", () => {
			const r = new Rect([
				[0, 0],
				[1, 1],
			])

			expect(r.containsPoint(new Point([0, 0]))).toStrictEqual(true)

			expect(
				new Rect([
					[20, 20],
					[30, 40],
				]).containsPoint(new Point([19, 25])),
			).toStrictEqual(false)
		})

		it("intersects ok", () => {
			const test = (a: RectLike, b: RectLike, c: RectLike | null) => {
				const res =
					new Rect(a).intersection(new Rect(b))?.normalized ?? null
				if (c === null) {
					expect(res).toBeNull()
				} else {
					expect(res?.equals(new Rect(c)) ?? false).toStrictEqual(
						true,
					)
				}
			}
			const zeros: RectLike = [
				[0, 0],
				[0, 0],
			]
			test(zeros, zeros, zeros)
			test(
				zeros,
				[
					[0, 0],
					[1, 1],
				],
				zeros,
			)
			test(
				[
					[32, 32],
					[33, 96],
				],
				[
					[32, 32],
					[64, 64],
				],
				[
					[32, 32],
					[33, 64],
				]
			)
		})
	})
})

/*
// TODO(teawithsand): port tests

import { Rect } from "tws-common/geometry/rect/define"
import {
	NORM_RECT_MAX,
	NORM_RECT_MIN,
	rectArea,
	rectDimensions,
	rectIntersection,
	rectNormalize,
	rectTransformDistances,
	rectTransformOffsets,
	rectTranslate,
} from "tws-common/geometry/rect/simple"

// TODO(teawithsand): replace this with some RNG, which is seed-based
const randomRect = () => {
	return rectNormalize([
		[Math.round(Math.random() * 1000), Math.round(Math.random() * 1000)],
		[Math.round(Math.random() * 1000), Math.round(Math.random() * 1000)],
	])
}

describe("rectangle op", () => {
	describe("rectTransformOffsets", () => {
		it("computes correct offset values for test data", () => {
			const tests: [
				Rect,
				Rect,
				{
					left: number
					right: number
					top: number
					bottom: number
				},
			][] = [
				[
					[
						[0, 0],
						[0, 0],
					],
					[
						[0, 0],
						[0, 0],
					],
					{
						bottom: 0,
						left: 0,
						right: 0,
						top: 0,
					},
				],
				[
					[
						[0, 0],
						[10, 10],
					],
					[
						[0, 0],
						[0, 0],
					],
					{
						bottom: 0,
						left: 0,
						right: -10,
						top: -10,
					},
				],
				[
					[
						[-10, -10],
						[10, 10],
					],
					[
						[0, 0],
						[0, 0],
					],
					{
						bottom: 10,
						left: 10,
						right: -10,
						top: -10,
					},
				],
				[
					[
						[-10, -10],
						[10, 10],
					],
					[
						[-5, -5],
						[5, 5],
					],
					{
						bottom: 5,
						left: 5,
						right: -5,
						top: -5,
					},
				],
				[
					[
						[-10, -10],
						[0, 0],
					],
					[
						[0, 0],
						[0, 0],
					],
					{
						bottom: 10,
						left: 10,
						right: 0,
						top: 0,
					},
				],
				[
					[
						[0, 0],
						[0, 0],
					],
					[
						[-10, -10],
						[0, 0],
					],
					{
						bottom: -10,
						left: -10,
						right: 0,
						top: 0,
					},
				],
			]

			for (const t of tests) {
				const res = rectTransformOffsets(t[0], t[1])
				expect(res).toEqual(t[2])
			}
		})

		it("gives zero for same rect", () => {
			for (let i = 0; i < 100; i++) {
				const destRect = randomRect()
				const offsets = rectTransformOffsets(destRect, destRect)

				expect(offsets).toEqual({
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				})
			}
		})

		it("computes correct relative offsets for random data", () => {
			for (let i = 0; i < 100; i++) {
				const sourceRect = randomRect()
				const destRect = randomRect()
				const offsets = rectTransformOffsets(sourceRect, destRect)

				const newRect = rectNormalize([
					[
						sourceRect[NORM_RECT_MIN][0] + offsets.left,
						sourceRect[NORM_RECT_MIN][1] + offsets.bottom,
					],
					[
						sourceRect[NORM_RECT_MAX][0] + offsets.right,
						sourceRect[NORM_RECT_MAX][1] + offsets.top,
					],
				])

				expect(destRect).toEqual(newRect)
			}
		})
	})

	describe("rectTransformDistances", () => {
		it("computes correct values for random data", () => {
			for (let i = 0; i < 100; i++) {
				const sourceRect = randomRect()
				const destRect = randomRect()
				const distances = rectTransformDistances(sourceRect, destRect)

				const srcRectDim = rectDimensions(sourceRect)
				const dstRectDim = rectDimensions(destRect)

				expect(
					srcRectDim.height + distances.top + distances.bottom,
				).toStrictEqual(dstRectDim.height)
				expect(
					srcRectDim.width + distances.left + distances.right,
				).toStrictEqual(dstRectDim.width)
			}
		})
	})

	describe("rectIntersection", () => {
		it("computes ok rect intersection", () => {
			const tests: [Rect, Rect, Rect | null][] = [
				[
					[
						[0, 0],
						[0, 0],
					],
					[
						[1, 1],
						[1, 1],
					],
					null,
				],
				[
					[
						[0, 0],
						[0, 0],
					],
					[
						[0, 0],
						[0, 0],
					],
					[
						[0, 0],
						[0, 0],
					],
				],
				[
					[
						[0, 0],
						[0, 0],
					],
					[
						[0, 0],
						[1, 1],
					],
					[
						[0, 0],
						[0, 0],
					],
				],
				[
					[
						[0, 0],
						[1, 1],
					],
					[
						[1, 1],
						[2, 2],
					],
					[
						[1, 1],
						[1, 1],
					],
				],
				[
					[
						[0, 0],
						[2, 2],
					],
					[
						[0, 0],
						[1, 1],
					],
					[
						[0, 0],
						[1, 1],
					],
				],
				[
					[
						[0, 2],
						[2, 3],
					],
					[
						[1, 1],
						[3, 1],
					],
					null,
				],
				[
					rectTranslate(
						[
							[0, 0],
							[3, 3],
						],
						[2, 2],
					),
					[
						[0, 0],
						[3, 3],
					],
					[
						[2, 2],
						[3, 3],
					],
				],
			]

			for (const [a, b, res] of tests) {
				const actualRes = rectIntersection(a, b)
				expect(res).toEqual(actualRes)
			}
		})

		it("returns argument, when intersecting with itself", () => {
			const r = randomRect()
			for (let i = 0; i < 100; i++) {
				const res = rectIntersection(r, r)
				expect(res).toEqual(r)
			}
		})

		it("passes random area based tests", () => {
			// Intersection of two rectangles always has area less than any of given

			for (let i = 0; i < 1000; i++) {
				const r1 = randomRect()
				const r2 = randomRect()

				const res = rectIntersection(r1, r2)
				const resArea = res ? rectArea(res) : 0

				// note: this is hacky way of doing deep comparison
				if (JSON.stringify(r1) === JSON.stringify(r2)) {
					expect(resArea).toEqual(rectArea(r1))
				} else {
					expect(resArea).toBeLessThanOrEqual(
						Math.min(rectArea(r1), rectArea(r2)),
					)
				}
			}
		})
	})
})

*/
