import { EntityData } from "@app/game/entity/external/data"

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

/**
 * Values are as follows:
 * 1. number of blocks to skip for each row/column from appropriate direction
 * 2. -1 if row/column is empty
 */
export type BlockCollisionData = {
	raw: boolean[][]
	topRay: number[]
	leftRay: number[]
	rightRay: number[]
	bottomRay: number[]
}

export type BlockData = {
	collisions: BlockCollisionData // ignored when block is in background

	// ignored for background blocks, in foreground blocks, used to determine whether entity is in water or not
	isWater: boolean
}

/**
 * Id of block that is not there
 */
export const emptyBlockId: BlockId = -1

export type PrePlacedEntityByReference = {
	x: number
	y: number
	reference: string // what this entity is called. Simple and should work.
}

export type PrePlacedEntity = {
	x: number
	y: number
	entityData: EntityData
}

// TODO(teawithsand): somehow handle translating these moving blocks into entities + define some constants for them
//  + write shift for time function for them. We may not want linear but something like sin-ease-in-out stuff or bezier curves
export const BLOCK_SHIFTER_OFFSET = BLOCK_WIDTH * 3

// Map design
// actually it's not as I've already written everything in math-like coordinate system(1st quarter).
// 
//  (0,0) -------------- (W,0)
//    |                    |
//    |                    |
//    |                    |
//  (0,H)                (W,H)
//
// There's no edge at the bottom. Entities should be killed once they are below H line.
// Also please note that this coordinate system is also used by SVG, so it's reasonable to use here.

export interface PartialMapData {
	blockData: {
		[key: BlockId]: BlockData
	}

	foregroundBlocks: BlockId[][]
	backgroundBlocks: BlockId[][]
}

export type MapData = PartialMapData & {
	width: number
	height: number

	prePlacedEntities: PrePlacedEntity[]
	
	name: string
	author: {
		name: string
	}
}
