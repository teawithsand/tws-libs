import { BinaryReader } from "@app/util/binary/reader"
import { Rect } from "@app/util/geometry"

export interface LegacyEntityIdTransformer {
	transformSoundId(id: string): string
	transformMasterSpriteFile(id: string): string
	transformSpriteFileWithCoords(id: string, r: Rect): string
}

export type RawLegacyEntityData = {
	version: string // only 1.3 is supported though
	type: number
	name: string
	display: {
		frames: {
			framesPath: string
			firstFrameX: number
			firstFrameY: number
			frameWidth: number
			frameHeight: number
			spaceBetweenFrames: number
			frameCount: number
		}
		width: number
		height: number
	}

	sound: {
		soundPaths: string[]
		soundTypes: number[]
	}

	animation: {
		animations: LegacyEntityAnimationData[]
		animationCount: number
		frameRate: number
	}

	miscSprites: {
		mutationSprite: string
		bonusSprite: string
	}

	game: {
		canGlide: boolean
		canSwim: boolean

		// TODO(teawithsand): replace it with enum of all attacks, as it's simpler
		//  then simply spawn entity on demand
		attackShoot: {
			time: number
			spritePath: string
		}
		attackEgg: {
			time: number
			spritePath: string
		}

		protectionType: number
		energy: number
		maxJumpTime: number
		killScore: number
	}
}

export type LegacyEntityAnimationData = {
	sequence: number[]
	frames: number
	loop: boolean
}

/**
 * Parses entity(sprite) data one-to-one as it's in C.
 *
 * Upper level parse function adopts it, so it's more JS readable.
 */
export const innerParseLegacyEntityData = (data: ArrayBuffer) => {
	const reader = new BinaryReader(data)
	const repeat = (i: number) => [...new Array(i).keys()]
	const assertBytesRead = (n: number) => {
		n += 4 // as we had to read version, which is not part of structure
		if (reader.byteOffset !== n)
			throw new Error(
				`Data read so far is not ${n - 4} but ${reader.byteOffset - 4}`,
			)
	}

	const version = reader.readStringFixed(4)
	assertBytesRead(0)

	const type = reader.readNByteNumber(4)
	assertBytesRead(4)
	const spriteImagePath = reader.readStringFixed(100)
	assertBytesRead(104)
	const soundPaths = repeat(7).map(() => reader.readStringFixed(100))
	assertBytesRead(804)
	const soundTypes = repeat(7).map(() => reader.readNByteNumber(4))
	assertBytesRead(832)
	const frameCount = reader.readNByteNumber(1)
	assertBytesRead(833)
	const animations = repeat(20).map(() => ({
		sequence: reader.readUnsignedNumbers(10),
		frames: reader.readNByteNumber(1),
		loop: reader.readBool(),
	}))
	assertBytesRead(1073)
	const animationCount = reader.readNByteNumber(1)
	assertBytesRead(1074)
	const frameRate = reader.readNByteNumber(1)
	assertBytesRead(1075)

	reader.advance(1) // padding here

	const xOfFirstFrame = reader.readNByteNumber(4)
	assertBytesRead(1080)
	const yOfFirstFrame = reader.readNByteNumber(4)
	assertBytesRead(1084)
	const frameWidth = reader.readNByteNumber(4)
	assertBytesRead(1088)
	const frameHeight = reader.readNByteNumber(4)
	assertBytesRead(1092)
	const spaceBetweenFrames = reader.readNByteNumber(4)
	assertBytesRead(1096)
	const name = reader.readStringFixed(30)
	assertBytesRead(1126)

	reader.advance(2) // padding here

	const width = reader.readNByteNumber(4)
	assertBytesRead(1132)
	const height = reader.readNByteNumber(4)
	assertBytesRead(1136)
	const weight = reader.readFloat64()
	assertBytesRead(1144)
	const isSpriteEnemy = reader.readBool()
	assertBytesRead(1145)

	reader.advance(3)

	const energy = reader.readNByteNumber(4)
	assertBytesRead(1152)

	const damageIfGotHit = reader.readNByteNumber(4)
	assertBytesRead(1156)

	const damageType = reader.readNByteNumber(1)
	assertBytesRead(1157)

	const protectionType = reader.readNByteNumber(1)
	assertBytesRead(1158)

	reader.advance(2)

	const killScore = reader.readNByteNumber(4)
	assertBytesRead(1164)

	const aiTypes = repeat(10).map(() => reader.readNByteNumber(4))
	assertBytesRead(1204)

	const maxJumpTime = reader.readNByteNumber(1)
	assertBytesRead(1205)

	reader.advance(3)

	const maxSpeed = reader.readFloat64()
	assertBytesRead(1216)

	const chargeTime = reader.readNByteNumber(4)
	assertBytesRead(1220)

	const color = reader.readNByteNumber(1)
	assertBytesRead(1221)

	const isWall = reader.readBool()
	assertBytesRead(1222)

	reader.advance(2)

	const destroyType = reader.readNByteNumber(4)
	assertBytesRead(1228)

	const canOpenLocks = reader.readBool()
	assertBytesRead(1229)

	const canVibrate = reader.readBool()
	assertBytesRead(1230)

	const bonusesCount = reader.readNByteNumber(1)
	assertBytesRead(1231)

	reader.advance(1)

	const attackOneTime = reader.readNByteNumber(4) // in frames
	assertBytesRead(1236)

	const attackTwoTime = reader.readNByteNumber(4) // in frames
	assertBytesRead(1240)

	const parallaxType = reader.readNByteNumber(4)
	assertBytesRead(1244)

	const mutateIntoSprite = reader.readStringFixed(100)
	assertBytesRead(1344)

	const bonusSprite = reader.readStringFixed(100)
	assertBytesRead(1444)

	const attackOneSpriteAmmo = reader.readStringFixed(100)
	assertBytesRead(1544)

	const attackTwoSpriteAmmo = reader.readStringFixed(100)
	assertBytesRead(1644)

	const isMakeSound = reader.readBool()
	assertBytesRead(1645)

	reader.advance(3)

	const soundFrequency = reader.readNByteNumber(4)
	assertBytesRead(1652)

	const randomFrequency = reader.readBool()
	assertBytesRead(1653)

	const isWallUp = reader.readBool()
	assertBytesRead(1654)
	const isWallDown = reader.readBool()
	assertBytesRead(1655)
	const isWallLeft = reader.readBool()
	assertBytesRead(1656)
	const isWallRight = reader.readBool()
	assertBytesRead(1657)

	const transparency = reader.readNByteNumber(1)
	assertBytesRead(1658)

	const isTransparent = reader.readBool()
	assertBytesRead(1659)

	reader.advance(1)

	const chargeTime2 = reader.readNByteNumber(4)
	assertBytesRead(1664)

	const canGlide = reader.readBool()
	const isBoss = reader.readBool()
	const isBonusAlways = reader.readBool()
	const isCanSwim = reader.readBool()

	assertBytesRead(1668)

	return {
		version,
		type,
		spriteImagePath,
		soundPaths,
		soundTypes,
		frameCount,
		animations,
		animationCount,
		frameRate,
		xOfFirstFrame,
		yOfFirstFrame,
		frameWidth,
		frameHeight,
		spaceBetweenFrames,
		name,
		width,
		height,
		weight,
		isSpriteEnemy,
		energy,
		damageIfGotHit,
		damageType,
		protectionType,
		killScore,
		aiTypes,
		maxJumpTime,
		maxSpeed,
		chargeTime,
		color,
		isWall,
		destroyType,
		canOpenLocks,
		canVibrate,
		bonusesCount,
		attackOneTime,
		attackTwoTime,
		parallaxType,
		mutateIntoSprite,
		bonusSprite,
		attackOneSpriteAmmo,
		attackTwoSpriteAmmo,
		isMakeSound,
		soundFrequency,
		randomFrequency,
		isWallUp,
		isWallDown,
		isWallLeft,
		isWallRight,

		transparency,
		isTransparent,
		chargeTime2,
		canGlide,
		isBoss,
		isBonusAlways,
		isCanSwim,
	}
}

export const parseLegacyEntityData = (
	data: ArrayBuffer,
): RawLegacyEntityData => {
	const inner = innerParseLegacyEntityData(data)

	return {
		type: inner.type,
		name: inner.name,
		version: inner.version,

		display: {
			frames: {
				firstFrameX: inner.xOfFirstFrame,
				firstFrameY: inner.yOfFirstFrame,
				frameCount: inner.frameCount,
				frameWidth: inner.frameWidth,
				frameHeight: inner.frameHeight,
				framesPath: inner.spriteImagePath,
				spaceBetweenFrames: inner.spaceBetweenFrames,
			},
			height: inner.height,
			width: inner.width,
		},

		animation: {
			animationCount: inner.animationCount,
			animations: inner.animations,
			frameRate: inner.frameRate,
		},

		miscSprites: {
			bonusSprite: inner.bonusSprite,
			mutationSprite: inner.mutateIntoSprite,
		},
		sound: {
			soundPaths: inner.soundPaths,
			soundTypes: inner.soundTypes,
		},
		game: {
			attackShoot: {
				time: inner.attackOneTime,
				spritePath: inner.attackOneSpriteAmmo,
			},
			attackEgg: {
				time: inner.attackTwoTime,
				spritePath: inner.attackTwoSpriteAmmo,
			},
			canGlide: inner.canGlide,
			canSwim: inner.isCanSwim,
			energy: inner.energy,
			killScore: inner.killScore,
			maxJumpTime: inner.maxJumpTime,
			protectionType: inner.protectionType,
		},
	}
}
