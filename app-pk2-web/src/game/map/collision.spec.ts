import { computeBlockCollisionData } from "@app/game/map/collision"

// TODO(teawithsand): put this function somewhere else
function transpose<T>(matrix: T[][]) {
	return matrix[0].map((_, c) => matrix.map((_, r) => matrix[r][c]))
}

// transpose, so first coord is x, not y

const solidLike = transpose([
	[true, true, true],
	[true, false, true],
	[true, true, true],
])

const cliff = transpose([
	[true, true, true],
	[false, true, true],
	[false, false, true],
])

const inverseCliff = transpose([
	[true, false, false],
	[true, true, false],
	[true, true, true],
])

describe("Block Collision operations", () => {
	it("converting top collisions ok ", () => {
		expect(computeBlockCollisionData(solidLike).topRay).toEqual([0, 0, 0])
		expect(computeBlockCollisionData(cliff).topRay).toEqual([0, 0, 0])
		expect(computeBlockCollisionData(inverseCliff).topRay).toEqual([
			0, 1, 2,
		])
	})

	it("converting bottom collisions ok", () => {
		expect(computeBlockCollisionData(solidLike).bottomRay).toEqual([
			0, 0, 0,
		])
		expect(computeBlockCollisionData(cliff).bottomRay).toEqual([2, 1, 0])
		expect(computeBlockCollisionData(inverseCliff).bottomRay).toEqual([
			0, 0, 0,
		])
	})

	it("converting left collisions ok", () => {
		expect(computeBlockCollisionData(solidLike).leftRay).toEqual([0, 0, 0])
		expect(computeBlockCollisionData(cliff).leftRay).toEqual([0, 1, 2])
		expect(computeBlockCollisionData(inverseCliff).leftRay).toEqual([
			0, 0, 0,
		])
	})

	it("converting right collisions ok", () => {
		expect(computeBlockCollisionData(solidLike).rightRay).toEqual([0, 0, 0])
		expect(computeBlockCollisionData(cliff).rightRay).toEqual([0, 0, 0])
		expect(computeBlockCollisionData(inverseCliff).rightRay).toEqual([
			2, 1, 0,
		])
	})
})
