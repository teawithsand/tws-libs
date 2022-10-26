import { BLOCK_HEIGHT, BLOCK_WIDTH } from "@app/game/data/map"
import { CollisionsMap } from "@app/game/entity/collisionMap"
import { computeBlockCollisionData } from "@app/game/map/collision"
import { Rect } from "@app/util/geometry"
import { transposeMatrix } from "@app/util/matrix"

const rep = <T>(v: T, n: number): T[] => new Array(n).fill(v)
const sqRep = <T>(v: T, n: number): T[][] => rep(rep(v, n), n)

describe("CollisionMap", () => {
	it("computes proper entity-block collision and surrounding ones", () => {
		const blocks = transposeMatrix([
			[-1, -1, -1, -1],
			[-1, -1, -1, -1], // (32,32) -> (64,64)
			[-1, -0, -0, -1],
			[-0, -0, -0, -0],
		])

		const cm = new CollisionsMap({
			blockData: {
				[0]: {
					backgroundURL: "niy",
					foregroundURL: "niy",
					collisions: computeBlockCollisionData(
						sqRep(true, BLOCK_WIDTH),
					),
					isWater: false,
				},
			},
			foregroundBlocks: blocks,
			backgroundBlocks: blocks,
		})

		const playerRect = new Rect([
			[0, 0],
			[BLOCK_WIDTH, BLOCK_HEIGHT * 2],
		]).normalized

		// const firstCollisions = cm.queryRectMapCollisions(
		// 	playerRect.translatedY(BLOCK_HEIGHT * 2),
		// )
		//
		// expect(firstCollisions.isInWater).toStrictEqual(false)
		// expect(firstCollisions.leftSideCollisions).toStrictEqual(null)
		// expect(firstCollisions.rightSideCollisions).toStrictEqual(null)

		const secondCollisions = cm.queryRectMapCollisions(
			playerRect.translatedY(BLOCK_HEIGHT),
		)

		expect(secondCollisions.isInWater).toStrictEqual(false)
		expect(secondCollisions.leftBlocks).toEqual([])
		expect(secondCollisions.rightBlocks.map(v => v.offsetX)).toEqual([1, 1])
	})
})
