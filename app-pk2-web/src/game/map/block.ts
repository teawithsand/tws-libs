export enum BlockType {
	BLOCK_XXX_ALAS = 40, // ?
	BLOCK_ELEVATOR_HORIZONTAL = 41,
	BLOCK_ELEVATOR_VERT = 42,
	BLOCK_SWITCH2_UP = 43,
	BLOCK_SWITCH3_RIGHT = 44,
	BLOCK_SWITCH2_DOWN = 45,
	BLOCK_SWITCH3_LEFT = 46,
	BLOCK_LOCK = 47,
	BLOCK_SKULL_WALL = 48,
	BLOCK_DISABLED_SKULL_WALL = 49,
	BLOCK_ANIM1 = 60,
	BLOCK_ANIM2 = 65,
	BLOCK_ANIM3 = 70,
	BLOCK_ANIM4 = 75,
	BLOCK_POWER_LEFT = 140,
	BLOCK_POWER_RIGHT = 141,
	BLOCK_POWER_UP = 142,
	BLOCK_HIDING = 143,
	BLOCK_FIRE = 144,
	BLOCK_SWITCH1 = 145,
	BLOCK_SWITCH2 = 146,
	BLOCK_SWITCH3 = 147,
	BLOCK_START = 148,
	BLOCK_END = 149,
}

// TODO(teawithsand): reverse engineer block shape from bitmap
/**
 * Defines block shape. Used for collision detection rather than anything else.
 */
export enum BlockShape {
	FULL_SQUARE = 1,
	BOTTOM_HALF_SQUARE = 2,
	BOTTOM_LEFT_TRIANGLE = 3,
	BOTTOM_RIGHT_TRIANGLE = 4,
	TOP_LEFT_TRIANGLE = 5,
	TOP_RIGHT_TRIANGLE = 6,

	// there are more, but for now they are NIY
	// please take a look at block shapes
	// in tiles bitmaps
}
/**
 * Basic definition of block.
 *
 * Contains it's type as well as collision data and some other details
 * other than this block display's logic.
 *
 * Does not contain things like whether block moves or not, whether button is pressed or not
 * or stuff like that. Only static definition.
 */
export type BlockStaticDefinition = {
	type: BlockType
	shape: BlockShape

	// Which block edge collides with specified block
	// each block has obviously four edges
	// but some blocks may have only top collision, 
	// say platforms you can jump on but you can't fall from these
	collisions: {
		top: boolean
		left: boolean
		right: boolean
		bottom: boolean
	}
}

export const BLOCK_WIDTH = 32
export const BLOCK_HEIGHT = 32

export const BLOCK_DEFINES: {
	[BlockKeyType in BlockType]?: BlockStaticDefinition & {
		type: BlockKeyType
	}
} = {
	[BlockType.BLOCK_END]: {
		type: BlockType.BLOCK_END,
		shape: BlockShape.FULL_SQUARE,
		collisions: {
			bottom: true,
			left: true,
			right: true,
			top: true,
		}
	},
}
