import { computeBlockCollisionData } from "@app/game/map/collision"
import { MapData } from "@app/game/map/defines"

export const computeMapDimensionsFromBlocks = <T extends number>(
	blocks: T[][],
	...matrices: T[][][]
) => {
    // Compute existence map from any amount of maps of same size
	const existenceMap = [blocks, ...matrices]
		.map(inner => inner.map(v => v.map(x => x >= 0)))
		.reduce((a, b) => a.map((v, i) => v || b[i]))

	// HACK: it's just that this function computes required stuff
	const collisions = computeBlockCollisionData(existenceMap)

	const offsetTop = collisions.topRay
		.map(v => (v < 0 ? blocks.length : v))
		.reduce((a, b) => Math.min(a, b))

	const offsetLeft = collisions.leftRay
		.map(v => (v < 0 ? blocks[0].length : v))
		.reduce((a, b) => Math.min(a, b))

	const offsetBottom =
		blocks.length -
		collisions.bottomRay
			.map(v => (v < 0 ? blocks.length + 1 : v))
			.reduce((a, b) => Math.min(a, b)) -
		1

	const offsetRight =
		blocks[0].length -
		collisions.rightRay
			.map(v => (v < 0 ? blocks[0].length + 1 : v))
			.reduce((a, b) => Math.min(a, b)) -
		1

	return {
		offsetTop,
		offsetLeft,
		offsetBottom,
		offsetRight,
		height: offsetBottom - offsetTop + 1,
		width: offsetRight - offsetLeft + 1,
	}
}

/**
 * Removes negative blocks from map data, so it starts at 0,0 coordinate and has width and height
 * equal to it's rows sizes.
 */
export const normalizeMapData = (md: MapData): MapData => {
	const offsetsForeground = computeMapDimensionsFromBlocks(
		md.foregroundBlocks,
		md.backgroundBlocks,
	)
	// background should have the same

	const sliceMap = <T>(a: T[][]) => {
		return a
			.slice(offsetsForeground.offsetLeft, offsetsForeground.offsetRight)
			.map(v =>
				v.slice(
					offsetsForeground.offsetTop,
					offsetsForeground.offsetBottom,
				),
			)
	}

	return {
		...md,

		foregroundBlocks: sliceMap(md.foregroundBlocks),
		backgroundBlocks: sliceMap(md.backgroundBlocks),
	}
}
