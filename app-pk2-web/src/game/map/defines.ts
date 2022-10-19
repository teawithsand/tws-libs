export const BLOCK_WIDTH = 32
export const BLOCK_HEIGHT = 32

/**
 * Port of following enum:
 *
 * ```
 * const u8 ILMA_NORMAALI			= 0;
 * const u8 ILMA_SADE				= 1;
 * const u8 ILMA_METSA				= 2;
 * const u8 ILMA_SADEMETSA			= 3;
 * const u8 ILMA_LUMISADE			= 4;
 * ```
 */
export enum MapClimate {
	NORMAL = 0,
	RAIN = 1,
	FOREST = 2,
	RAINY_FOREST = 3,
	SNOW = 4, // afaik unused in pre-build map packs
}

export enum MapBackgroundMovementType {
	STATIC = 0,
	PARALLAX_VERTICAL = 1,
	PARALLAX_HORIZONTAL = 2,
	PARALLAX_VERTICAL_HORIZONTAL = 3,
}

export type BlockId = number

export type BlockCollisionData = {
	raw: boolean[][]
	topRay: number[]
	leftRay: number[]
	rightRay: number[]
	bottomRay: number[]
}

export type BlockData = {
	foregroundURL: string // typically these are same
	backgroundURL: string // typically these are same
	collisions: BlockCollisionData // ignored when block is in background

	// ignored for background blocks, in foreground blocks, used to determine whether entity is in water or not
	isWater: boolean
}

/**
 * Id of block that is not there
 */
export const emptyBlockId: BlockId = -1

export type PrePlacedEntity = {
	x: number
	y: number
	reference: string
}

export type MapData = {
	blockData: {
		[key: BlockId]: BlockData
	}

	backgroundImageURL: string

	width: number
	height: number

	foregroundBlocks: BlockId[][]
	backgroundBlocks: BlockId[][]
	prePlacedEntities: PrePlacedEntity
}
