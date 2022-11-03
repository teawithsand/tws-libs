import { EntityAiType } from "@app/game/data/entityAi"
import { EntityAnimation } from "@app/game/data/entityAnimation"
import { RawLegacyEntityData } from "@app/game/entity/external/legacy"
import { LegacyEntityData } from "@app/game/entity/external/legacyDefines"
import { ShouldBeSet } from "@app/util/set"

export enum EntityColorFilter {
	NIY = 1,
}

export enum EntityAttackFrontType {
	JUST_HORN = 1,
	WALL_PENETRATING_HORN = 2,
	MUD = 3,
	FIRE = 4,
	FIRE_FALLING = 5,
	ICE_FALLING = 6,
}

export enum EntityAttackBottomType {
	JUST_EGG = 1,
	FIRE_EGG = 2,
	ICE_EGG = 3,
	FIRE_BOMB = 4,
}

export enum EntityDamageType {
	ATTACK_FRONT = 1,
	ATTACK_BOTTOM = 2,
	SPIKES = 3,
	LAVA = 4,
	OUT_OF_MAP = 5, // this one is kind of special though, maybe give it separate function
	STANDING_FIRE = 6,
	ICE_FALL = 7,
	COLLECTABLE_ENTITY_FALL = 8, // things like apples may damage mobs, but not player
	OTHER_ENTITY_FALL = 9, // things like big rocks falling may damage both player and mobs
}

export type EntityDamage =
	| {
			type: EntityDamageType.ATTACK_FRONT
			attackType: EntityAttackFrontType
	  }
	| {
			type: EntityDamageType.ATTACK_BOTTOM
			attackType: EntityAttackBottomType
	  }
	| {
			type: EntityDamageType.SPIKES
	  }
	| {
			type: EntityDamageType.LAVA
	  }
	| {
			type: EntityDamageType.OUT_OF_MAP
	  }
	| {
			type: EntityDamageType.ICE_FALL
	  }
	| {
			type: EntityDamageType.COLLECTABLE_ENTITY_FALL
	  }
	| {
			type: EntityDamageType.OTHER_ENTITY_FALL
	  }

export enum EntitySoundAction {
	DAMAGE = 1,
	DESTRUCTION = 2,
	ATTACK_FRONT = 3,
	ATTACK_BOTTOM = 4,
	RANDOM = 5,
	SPECIAL1 = 6,
	SPECIAL2 = 7,
}

export enum EntityDataDisposition {
	PLAYER = 1,
	NPC_ENEMY = 2,
	NPC_NEUTRAL = 3,
	TELEPORT = 4,
	PROJECTILE = 5,
	BONUS = 6,
	BACKGROUND = 7,
}

export enum EntityAnimationDisposition {
	IDLE = 1,
	WALKING = 2,
	JUMP_UP = 3,
	JUMP_DOWN = 4,
	SQUAT = 5,
	DAMAGE = 6,
	DEATH = 7,
	ATTACK_FRONT = 8,
	ATTACK_BOTTOM = 9,
}

export type EntitySoundData = {
	soundFiles: {
		[key in EntitySoundAction]: string
	}
}

export type EntityCollisionData = {
	width: number
	height: number
	heightCrouch: number
}

export type EntityPresentationData = {
	animations: EntityAnimationData
	colorFilter: EntityColorFilter | null
}

export type EntityAnimationData = {
	[key in EntityAnimationDisposition]: EntityAnimation
}

export type CharacterEntityData = {
	initialLives: number

	attackFront: EntityAttackFrontType | null
	attackBottom: EntityAttackBottomType | null

	// immuneToFire: boolean // idk if it's used.

	damagedByWater: boolean
	canMoveFastInWater: boolean

	contactDamage: number
	fallDamage: number

	// ignored for non-damageable types
	attackFrontImmunities: ShouldBeSet<EntityAttackFrontType>
	attackBottomImmunities: ShouldBeSet<EntityAttackBottomType>

	aiDecisionList: EntityAiType[] // ignored for non-npc types, like player
}

export type EntityData = {
	disposition: EntityDataDisposition
	name: string

	legacy?: RawLegacyEntityData | LegacyEntityData // for debugging reasons

	collisionData: EntityCollisionData
	soundData: EntitySoundData
	presentationData: EntityPresentationData
	characterData: CharacterEntityData
}
