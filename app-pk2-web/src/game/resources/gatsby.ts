import { throwExpression } from "@app/../../tws-stl/dist"
import {
	CharacterEntityData,
	EntityAnimationDisposition,
	EntityCollisionData,
	EntityData,
	EntityDataDisposition,
	EntitySoundAction,
	EntitySoundData,
} from "@app/game/data/entity"
import {
	EntityAnimation,
	EntityAnimationImage,
	EntityAnimationImageType,
	EntityAnimationType,
} from "@app/game/data/entityAnimation"
import { BlockData, MapData, PrePlacedEntity } from "@app/game/data/map"
import {
	parseLegacyEntityData,
	RawLegacyEntityData,
} from "@app/game/entity/external/legacy"
import {
	LegacyEntityAnimationType,
	LegacyEntitySoundType,
	translateLegacyEntityAnimationType,
	translateLegacyEntitySoundType,
} from "@app/game/entity/external/legacyDefines"
import { LegacyMapData, parseLegacyMap } from "@app/game/map"
import {
	computeBlockCollisionData,
	computeRawBlockCollisions,
} from "@app/game/map/collision"
import { GatsbyResourcesUtil } from "@app/game/resources/managed"
import { debugAssert } from "@app/util/assert"
import { Rect } from "@app/util/geometry"

export interface GameResources {
	readonly backgroundImageUrl: string
	readonly mapData: MapData

	release(): void
}

export interface GameResourceLoaders {
	loadLegacyResources(epName: string, mapName: string): Promise<GameResources>
}

export class GatsbyResourceLoader implements GameResourceLoaders {
	readonly legacyEpisodes: string[]
	readonly legacyEpisodesMaps: {
		[key: string]: string[]
	}

	constructor(private readonly resUtil: GatsbyResourcesUtil) {
		this.legacyEpisodes = [
			...new Set(
				resUtil.res.allFile.nodes
					.map(
						e =>
							e.relativePath.match(
								/^episodes\/(.*)\/.+\.map$/,
							) ?? ["", ""],
					)
					.map(v => v[1])
					.filter(v => !!v),
			),
		]

		this.legacyEpisodesMaps = Object.fromEntries(
			this.legacyEpisodes.map(epName => [
				epName,
				resUtil.res.allFile.nodes
					.map(
						e =>
							e.relativePath.match(
								/^episodes\/(.*)\/(.+\.map)$/,
							) ?? ["", "", ""],
					)
					.filter(v => v[1] === epName)
					.map(v => v[2]),
			]),
		)
	}

	private load = async (u: string): Promise<ArrayBuffer> => {
		if (!u) throw new Error(`Tried to fetch empty url ${u}`)
		return await (await fetch(u)).arrayBuffer()
	}

	private resolveLegacyMap = async (
		epName: string,
		mapName: string,
	): Promise<LegacyMapData> => {
		const legacyMapBytes = await this.load(
			this.resUtil.queryPathSegments(["episodes", epName, mapName]),
		)

		return parseLegacyMap(legacyMapBytes)
	}

	private resolveLegacyEntity = async (
		entityName: string,
	): Promise<RawLegacyEntityData> => {
		const data = await this.load(
			this.resUtil.queryPathSegments(["models", "data", entityName]),
		)

		return parseLegacyEntityData(data)
	}

	private resolveEntityData = async (
		entityName: string,
	): Promise<EntityData> => {
		const legacy = await this.resolveLegacyEntity(entityName)

		const disposition = ((): EntityDataDisposition => {
			return EntityDataDisposition.PLAYER
		})()

		return {
			disposition,
			name: legacy.name,
			legacy: legacy,
			characterData: {
				initialLives: legacy.game.energy,
			} as CharacterEntityData, // TODO(teawithsand): impl these
			collisionData: {
				height: legacy.display.height,
				width: legacy.display.width,
				heightCrouch: legacy.display.height / 2,
			} as EntityCollisionData,
			presentationData: {
				animations: Object.fromEntries(
					legacy.animation.animations
						.slice(0, legacy.animation.animationCount)
						.map(
							(
								a,
								i,
							): [
								EntityAnimationDisposition,
								EntityAnimation,
							] => [
								translateLegacyEntityAnimationType(
									i as LegacyEntityAnimationType,
								),
								{
									type: EntityAnimationType.SIMPLE,
									animation: {
										frameRate: legacy.animation.frameRate,
										frames: a.sequence
											.slice(0, a.frames)
											.map(v => v - 1) // frames with zero index are ones, which do not exist. 1 indexing is used here
											.map(
												(i): EntityAnimationImage => ({
													url:
														this.resUtil.queryPathSegments(
															[
																"models",
																"sprites",
																legacy.animation
																	.spriteImagePath,
															],
															[".bmp", ".png"],
														) ||
														throwExpression(
															new Error(
																`Invalid sprite image path was provided ${legacy.animation.spriteImagePath}`,
															),
														),
													rect: new Rect([
														[
															legacy.display
																.frames
																.firstFrameX +
																(legacy.display
																	.frames
																	.frameWidth +
																	legacy
																		.display
																		.frames
																		.spaceBetweenFrames) *
																	i,
															legacy.display
																.frames
																.firstFrameY,
														],
														[
															legacy.display
																.frames
																.firstFrameX +
																legacy.display
																	.frames
																	.frameWidth *
																	(i + 1) +
																legacy.display
																	.frames
																	.spaceBetweenFrames *
																	i,
															legacy.display
																.frames
																.firstFrameY +
																legacy.display
																	.frames
																	.frameHeight,
														],
													]),
													type: EntityAnimationImageType.SUB_IMAGE,
												}),
											),
										loop: a.loop,
									},
								},
							],
						),
				) as {
					[key in EntityAnimationDisposition]: EntityAnimation
				},
				colorFilter: null, // TODO(teawithsand): translate these
			},
			soundData: {
				soundFiles: Object.fromEntries(
					legacy.sound.soundTypes
						.map((v, i): [LegacyEntitySoundType, string] => [
							i,
							legacy.sound.soundPaths[i],
						])
						.filter(([t, p]) => t >= 0 && p !== "")
						.map(([t, p]): [EntitySoundAction, string] => [
							translateLegacyEntitySoundType(t),
							p,
						]),
				),
			} as EntitySoundData,
		}
	}

	loadLegacyResources = async (
		epName: string,
		mapName: string,
	): Promise<GameResources> => {
		const map = await this.resolveLegacyMap(epName, mapName)

		const backgroundImageUrl = this.resUtil.queryPathSegments(
			["scenery", map.backgroundImagePath],
			[".bmp", ".png"],
		)

		debugAssert(!!backgroundImageUrl, "No background image")

		const palettePathSegments = map.blockPaletteImagePath.split("/")
		const paletteName = palettePathSegments[
			palettePathSegments.length - 1
		].replace(".bmp", "")

		const blockToUrlEntries = [...new Array(256).keys()].map(
			(v): [number, string] => [
				v,
				this.resUtil
					.queryPathSegments([
						"blocks",
						paletteName,
						v.toString() + ".png",
					])
					.trim(),
			],
		)

		const bd: {
			[key: number]: BlockData
		} = {}

		for (const [k, v] of blockToUrlEntries) {
			if (!v) continue
			bd[k] = {
				collisions: computeBlockCollisionData(
					await computeRawBlockCollisions(v),
				),
				backgroundUrl: v,
				foregroundUrl: v,
				isWater: false, // TODO(teawithsand): this depends
			}
		}

		const prePlacedEntities: PrePlacedEntity[] = []

		let x = 0
		for (const col of map.body.sprites) {
			let y = 0
			for (const s of col) {
				if (s >= 0 && s !== 255) {
					prePlacedEntities.push({
						x,
						y,
						entityData: await this.resolveEntityData(
							map.prototypes[s] ||
								throwExpression(
									new Error(`No sprite with id ${s}`),
								),
						),
					})
				}
				y++
			}
			x++
		}

		const md: MapData = {
			blockData: {
				blockData: bd,
				backgroundBlocks: map.body.background,
				foregroundBlocks: map.body.foreground,
				height: map.height,
				width: map.width,
			},
			author: {
				name: map.authorName,
			},
			name: map.mapName,
			prePlacedEntities,
		}

		return {
			backgroundImageUrl,
			mapData: md,
			release() {
				// noop in this case, as we do not generate bitmaps for sliced images ASAP
			},
		}
	}
}
