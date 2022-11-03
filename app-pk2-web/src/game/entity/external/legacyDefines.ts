import {
	EntityAnimationDisposition,
	EntitySoundAction,
} from "@app/game/data/entity"
import { LegacyEntityAnimationData } from "@app/game/entity/external/legacy"
import { EnumTranslatorBuilder } from "@app/util/enumTranslator"

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

export const translateLegacyEntityAnimationType = new EnumTranslatorBuilder<
	LegacyEntityAnimationType,
	EntityAnimationDisposition
>()
	.value(
		LegacyEntityAnimationType.ATTACK1,
		EntityAnimationDisposition.ATTACK_FRONT,
	)
	.value(
		LegacyEntityAnimationType.ATTACK2,
		EntityAnimationDisposition.ATTACK_BOTTOM,
	)
	.value(LegacyEntityAnimationType.IDLE, EntityAnimationDisposition.IDLE)
	.value(
		LegacyEntityAnimationType.WALKING,
		EntityAnimationDisposition.WALKING,
	)
	.value(
		LegacyEntityAnimationType.JUMP_UP,
		EntityAnimationDisposition.JUMP_UP,
	)
	.value(
		LegacyEntityAnimationType.JUMP_DOWN,
		EntityAnimationDisposition.JUMP_DOWN,
	)
	.value(LegacyEntityAnimationType.SQUAT, EntityAnimationDisposition.SQUAT)
	.value(LegacyEntityAnimationType.DEATH, EntityAnimationDisposition.DEATH)
	.value(LegacyEntityAnimationType.DAMAGE, EntityAnimationDisposition.DAMAGE)
	.build()

export enum LegacyEntitySoundType {
	DAMAGE = 0,
	DESTRUCTION = 1,
	ATTACK1 = 2,
	ATTACK2 = 3,
	RANDOM = 4,
	SPECIAL1 = 5,
	SPECIAL2 = 6,
}

export const translateLegacyEntitySoundType = new EnumTranslatorBuilder<
	LegacyEntitySoundType,
	EntitySoundAction
>()
	.value(LegacyEntitySoundType.DAMAGE, EntitySoundAction.ATTACK_FRONT)
	.value(LegacyEntitySoundType.DESTRUCTION, EntitySoundAction.DESTRUCTION)
	.value(LegacyEntitySoundType.ATTACK1, EntitySoundAction.ATTACK_FRONT)
	.value(LegacyEntitySoundType.ATTACK2, EntitySoundAction.ATTACK_BOTTOM)
	.value(LegacyEntitySoundType.RANDOM, EntitySoundAction.RANDOM)
	.value(LegacyEntitySoundType.SPECIAL1, EntitySoundAction.SPECIAL1)
	.value(LegacyEntitySoundType.SPECIAL2, EntitySoundAction.SPECIAL2)
	.build()

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

/*
export const entityDataFromLegacyEntityData = (
	data: LegacyEntityData,
	transformer: LegacyEntityIdTransformerSync,
): EntityData => {
	const disposition: EntityDataDisposition = (() => {
		switch (data.type) {
			case LegacyEntityType.GAME_CHARACTER:
				if (data.isEnemy) return EntityDataDisposition.NPC_ENEMY
				else return EntityDataDisposition.NPC_NEUTRAL
			case LegacyEntityType.BACKGROUND:
				return EntityDataDisposition.BACKGROUND
			case LegacyEntityType.BONUS:
				return EntityDataDisposition.BONUS
			case LegacyEntityType.TELEPORT:
				return EntityDataDisposition.TELEPORT
			case LegacyEntityType.PROJECTILE:
				return EntityDataDisposition.PROJECTILE
			case LegacyEntityType.NOTHING:
				throw new Error("NIY what even that thing is")
			default:
				throw new Error(
					`Type ${data.type} has not yet been translated from legacy types`,
				)
		}
	})()

	const soundData: EntitySoundData = (() => {
		const res: [EntitySoundAction, string][] = []

		for (const k in data.soundData) {
			const v = parseInt(k) as LegacyEntitySoundType
			const sd = data.soundData[v]

			if (sd) {
				res.push([
					translateLegacyEntitySoundType(v),
					transformer.transformSoundId(sd),
				])
			}
		}
		return {
			soundFiles: Object.fromEntries(res),
		} as EntitySoundData // FIXME(teawithsand): this cast is not so safe to use and should be removed in future.
	})()

	const characterData: CharacterEntityData = (() => {
		return {
			initialLives: data.startEnergy,
			aiDecisionList: [EntityAiType.NOOP], //data.ai, // TODO: translate it
			attackBottom: null,
			attackFront: null,
			attackBottomImmunities: [],
			attackFrontImmunities: [],
			canMoveFastInWater: false,
			contactDamage: 1,
			damagedByWater: false,
			fallDamage: 1,
		}
	})()

	const collisionData: EntityCollisionData = (() => {
		return {
			height: data.height,
			width: data.width,
			heightCrouch: data.height / 2, // TODO(teawithsand): better formula for it + not all entities may crouch
			noCollision: ![EntityDataDisposition.PLAYER].includes(disposition),
		}
	})()

	const presentationData: EntityPresentationData = (() => {
		const entries: [EntityAnimationDisposition, EntityAnimation][] = []
		for (const k in data.animationData) {
			const ty = parseInt(k) as LegacyEntityAnimationType
			const v = data.animationData[ty]
			if (!v) continue

			entries.push([
				translateLegacyEntityAnimationType(ty),
				{
					type: EntityAnimationType.SIMPLE,
					animation: {
						frames: v.sequence
							.map(frameId => data.frameData.frames[frameId])
							.map(v => ({
								type: EntityAnimationImageType.SUB_IMAGE,
								rect: [v.x1, v.y1, v.x2, v.y2],
								url: transformer.transformMasterEntitySpritesFile(
									data.frameData.source,
								),
							})),
						loop: v.loop,
					},
				},
			])
		}
		return {
			colorFilter: null,
			animations: Object.fromEntries(
				entries,
			) as EntityPresentationData["animations"], // FIXME: this cast is unsafe
		}
	})()

	return {
		disposition,

		soundData,
		characterData,
		collisionData,
		presentationData,
	}
}
*/
