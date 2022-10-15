import { LegacyEntityAnimationData } from "@app/game/entity/external/legacy"

export enum LegacyEntityAnimationType {
	IDLE = 0,
	WALKING = 1,
	JUMP_UP = 2,
	JUMP_DOWN = 3,
	SQUAT = 4,
	DAMAGE = 5,
	DEATH = 6,
	ATTACK1 = 7,
	ATTACK2 = 8,
}

export enum LegacyEntitySoundType {
	DAMAGE = 0,
	DESTRUCTION = 1,
	ATTACK1 = 2,
	ATTACK2 = 3,
	RANDOM = 4,
	SPECIAL1 = 5,
	SPECIAL2 = 6,
}

export enum LegacyEntityType {
	NOTHING = 0,
	GAME_CHARACTER = 1,
	BONUS = 2,
	PROJECTILE = 3,
	TELEPORT = 4,
	BACKGROUND = 5,
}

export enum LegacyEntityColor {
	COLOR_GRAY = 0,
	COLOR_BLUE = 32,
	COLOR_RED = 64,
	COLOR_GREEN = 96,
	COLOR_ORANGE = 128,
	COLOR_VIOLET = 160,
	COLOR_TURQUOISE = 192,
	COLOR_NORMAL = 255,
}

export type LegacyEntityResourceLocator = string

export type LegacyEntityFrame = {
	x1: number
	x2: number
	y1: number
	y2: number
}

export type LegacyEntityData = {
	name: string
	type: LegacyEntityType

	width: number
	height: number
	weight: number
	startEnergy: number

	isEnemy: boolean
	ai: number[]

	startAttackShoot?: {
		entity: LegacyEntityResourceLocator
		delay: number
		time: number
	}

	endAttackShoot?: {
		entity: LegacyEntityResourceLocator
		delay: number
		time: number
	}

	frameData: {
		source: LegacyEntityResourceLocator
		frames: LegacyEntityFrame[]
	}

	animationData: {
		[key in LegacyEntityAnimationType]?: LegacyEntityAnimationData
	}

	soundData: {
		[key in LegacyEntitySoundType]?: LegacyEntityResourceLocator
	}
}
