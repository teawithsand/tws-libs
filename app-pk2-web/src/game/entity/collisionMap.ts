import { BlockId, BlockMapData, BLOCK_HEIGHT, BLOCK_WIDTH } from "@app/game/data/map"
import { SpatialHashMap } from "@app/util/ds/spatialMap"
import { Point, Rect } from "@app/util/geometry"
import { Vec2 } from "@app/util/vector"

export type CollisionsMapBlock = {
	offsetX: number
	offsetY: number
	x: number
	y: number
}

export type CollisionCheckResult = {
	isInWater: boolean
	windVector: Vec2

	// actually, these blocks should be arrays, as more than one could be neighbor of queried rectangle
	leftBlocks: CollisionsMapBlock[]
	rightBlocks: CollisionsMapBlock[]
	topBlocks: CollisionsMapBlock[]
	bottomBlocks: CollisionsMapBlock[]

	isOutsideWorld: boolean
}

const WIND_LEFT_VEC = new Vec2(-0.3, 0)
const WIND_RIGHT_VEC = WIND_LEFT_VEC.mulScalar(-1)

/**
 * Factor by which water slows down entities, which are not flagged as canSwim.
 */
export const WATER_VECTOR_SHRINKING_FACTOR = 1 / 4

export class CollisionsMap {
	private mapHeight: number
	private mapWidth: number

	// TODO(teawithsand): abstract this away to some method(as we perform only queries outside constructor, so this should be easy)
	// and then in future provide more performant implementation of querying blocks for specified rect
	private readonly mapSpatialMap = new SpatialHashMap<{
		foreground: BlockId
		background: BlockId
		offsetX: number
		offsetY: number
	}>(BLOCK_WIDTH, BLOCK_HEIGHT)

	constructor(private readonly mapData: BlockMapData) {
		for (let i = 0; i < mapData.foregroundBlocks.length; i++) {
			for (let j = 0; j < mapData.foregroundBlocks[i].length; j++) {
				const foreground = mapData.foregroundBlocks[i][j]
				const background = mapData.backgroundBlocks[i][j]

				this.mapSpatialMap.newClient(
					{
						background: background,
						foreground: foreground,
						offsetX: i,
						offsetY: j,
					},
					new Rect([
						[i * BLOCK_WIDTH, j * BLOCK_HEIGHT],
						[(i + 1) * BLOCK_WIDTH, (j + 1) * BLOCK_HEIGHT],
					]),
				)
			}
		}

		this.mapHeight = mapData.foregroundBlocks[0].length
		this.mapWidth = mapData.foregroundBlocks.length
	}

	queryRectMapCollisions = (rect: Rect): CollisionCheckResult => {
		// TODO(teawithsand): here check if rect is:
		// 1. in water
		// 2. affected by wind
		// 3. If entity can be moved to left or right
		// 4. Outside-of-world collisions

		rect = rect.normalized

		const blocksColliding = this.mapSpatialMap.getIntersectingValues(
			rect,
			false,
		)

		const isInWater = blocksColliding.some(
			b => this.mapData.blockData[b.background]?.isWater ?? false,
		)

		const windVector = (
			blocksColliding.some(
				b => b.background === 140 || b.foreground === 140,
			)
				? WIND_LEFT_VEC
				: Vec2.zero()
		).addVec(
			blocksColliding.some(
				b => b.background === 141 || b.foreground === 141,
			)
				? WIND_RIGHT_VEC
				: Vec2.zero(),
		)

		// TODO(teawithsand): write rectangles for testing collisions of specified rect with rectangles to the left or right

		const collisionQueryMargin = 1

		const getBlocksForRect = (
			transforms: (r: Rect) => Rect,
			direction: "vertical" | "horizontal" = "horizontal",
		): CollisionsMapBlock[] => {
			// rect is horizontal, when horizontal checking is done
			// so rect is vertical line in that case
			const r0 =
				direction === "horizontal"
					? new Rect([
							[0, 0],
							[collisionQueryMargin, rect.height],
					  ])
					: new Rect([
							[0, 0],
							[rect.width, collisionQueryMargin],
					  ])

			const finalRect = transforms(
				r0.translated(new Point([rect.p1.x, rect.p1.y])),
			)

			/*
			debugAssert(
				finalRect.intersection(rect) === null,
				`Rect must not intersect original rect. Now it's ${finalRect
					.intersection(rect)
					?.toString()}`,
			)
			*/

			return this.mapSpatialMap
				.getIntersectingValues(finalRect, false)
				.map(v => ({
					x: v.offsetX * BLOCK_WIDTH,
					y: v.offsetY * BLOCK_WIDTH,
					offsetX: v.offsetX,
					offsetY: v.offsetY,
				}))
		}

		const rightBlocks = getBlocksForRect(
			r =>
				r.translated(new Point([rect.width + collisionQueryMargin, 0])),
			"horizontal",
		)

		const leftBlocks = getBlocksForRect(
			r => r.translated(new Point([-collisionQueryMargin, 0])),
			"horizontal",
		)
		const topBlocks = getBlocksForRect(
			r => r.translated(new Point([0, -collisionQueryMargin])),
			"vertical",
		)

		const bottomBlocks = getBlocksForRect(
			r =>
				r.translated(
					new Point([0, rect.height + collisionQueryMargin]),
				),
			"vertical",
		)

		return {
			isOutsideWorld: rect.p1.y > this.mapHeight,
			isInWater,
			windVector,

			bottomBlocks: bottomBlocks,
			topBlocks: topBlocks,
			leftBlocks: leftBlocks,
			rightBlocks: rightBlocks,
		}
	}
}
