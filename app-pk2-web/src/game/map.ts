import { throwExpression } from "@teawithsand/tws-stl"

import { BinaryReader } from "../util/binary/reader"

// TODO(teawithsand): port map to new design
//  compute map boundaries and so on from legacy map to new easy map format, which has dimensions as fields
//  rather than c-style array

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

export const DEFAULT_MAP_WIDTH = 256
export const DEFAULT_MAP_HEIGHT = 224

export type LegacyMapData = {
	version: "1.3" // no other versions supported
	blockPaletteImagePath: string
	backgroundImagePath: string
	musicFilePath: string

	mapName: string
	authorName: string

	climate: MapClimate
	backgroundMovementType: MapBackgroundMovementType

	playerSpriteId: number

	// (this info is in original pk2 map files; it's not used by my port as it has different design)
	mapOfMap: {
		levelOfTheEpisode: number // which level of the episode this map is
		x: number
		y: number
		iconId: number
	}

	mapTimeSeconds: number | null // time for map walkthrough

	width: number
	height: number

	// body: {
	// 	background: number[][]
	// 	foreground: number[][]
	// 	sprites: number[][]
	// }
}

export class MapParseError extends Error {}

const readMapContentsArray = (rd: BinaryReader): number[][] => {
	const res: number[][] = []

	for (let i = 0; i < DEFAULT_MAP_WIDTH; i++) {
		res.push([...new Array(DEFAULT_MAP_HEIGHT).keys()].fill(-1))
	}

	const offsetX = rd.readDecimalIntFixed()
	const offsetY = rd.readDecimalIntFixed()
	const levels = rd.readDecimalIntFixed()
	const columns = rd.readDecimalIntFixed()

	for (let y = offsetY; y <= offsetY + columns; y++) {
		const data = rd.readUnsignedNumbers(levels + 1)

		for (let i = 0; i < levels + 1; i++) {
			res[y][i + offsetX] =
				data.pop() ??
				throwExpression(
					new MapParseError("Pop filed. Invalid offsets provided."),
				)
		}
	}

	return res
}

export const newParseLegacyMapBlob = (buffer: ArrayBuffer) => {
	try {
		const rd = new BinaryReader(buffer)

		const version = rd.readStringFixed(5)
		const blockPaletteImagePath = rd.readStringFixed(13)
		const backgroundImagePath = rd.readStringFixed(13)
		const musicFilePath = rd.readStringFixed(13)
		const mapName = rd.readStringFixed(40).replace(/Ì.*$/, "") // replace required, this is what pk2 code does
		const authorName = rd.readStringFixed(40).replace(/Ì.*$/, "") // like above

		const levelOfTheEpisode = rd.readDecimalIntFixed()
		const mapClimate = rd.readDecimalIntFixed()

		rd.advance(3 * 8) // three unused button times

		const mapTimeSeconds = rd.readDecimalIntFixed()

		rd.advance(8)

		const backgroundMovementType = rd.readDecimalIntFixed()

		const playerSpriteId = rd.readDecimalIntFixed()

		const mapOnEpisodeX = rd.readDecimalIntFixed()
		const mapOnEpisodeY = rd.readDecimalIntFixed()
		const mapOnEpisodeIconId = rd.readDecimalIntFixed()

		const protoCount = rd.readDecimalIntFixed()

		const prototypes: string[] = []
		for (let i = 0; i < protoCount; i++) {
			prototypes.push(rd.readStringFixed(13))
		}

		const backgroundTilesIds = readMapContentsArray(rd)
		const foregroundTilesIds = readMapContentsArray(rd)
		const mapSpritesIds = readMapContentsArray(rd)

		return {
			version,
			blockPaletteImagePath,
			backgroundImagePath,
			musicFilePath,
			mapName,
			authorName,
			mapClimate: mapClimate as MapClimate,
			levelOfTheEpisode,
			mapTimeSeconds,
			backgroundMovementType:
				backgroundMovementType as MapBackgroundMovementType,
			playerSpriteId,
			mapOnEpisodeX,
			mapOnEpisodeY,
			mapOnEpisodeIconId,
			prototypes,

			map: {
				backgroundTilesIds,
				// foregroundTilesIds,
				// mapSpritesIds,
			},
		}
	} catch (e) {
		if (e instanceof MapParseError) {
			throw e
		}
		throw new MapParseError(`Filed to parse map due to ${e}`)
	}
}
