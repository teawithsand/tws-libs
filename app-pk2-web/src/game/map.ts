import {
	mustReadPositiveFixedDecimalNumber,
	readPositiveFixedDecimalNumber,
	readStringConstSize,
} from "../util/binary/bytes"
import { version } from "os"

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

	body: {
		background: number[][]
		foreground: number[][]
		sprites: number[][]
	}
}

export class MapParseError extends Error {}

export const load13LegacyMapBlob = (buffer: ArrayBuffer): LegacyMapData => {
	let offset = 0

	{
		const version = readStringConstSize(buffer.slice(offset), 5)
		offset += 5
		if (version !== "1.3") {
			throw new MapParseError(
				"Version is not 1.3. Others are not supported"
			)
		}
	}

	const blockPaletteImagePath = readStringConstSize(buffer.slice(offset), 13)
	offset += 13

	const backgroundImagePath = readStringConstSize(buffer.slice(offset), 13)
	offset += 13

	const musicFilePath = readStringConstSize(buffer.slice(offset), 13)
	offset += 13

	// TODO(teawithsand): apply 0xcd hack
	const mapName = readStringConstSize(buffer.slice(offset), 40)
	offset += 40

	const authorName = readStringConstSize(buffer.slice(offset), 40)
	offset += 40

	const decNumberSize = 8

	const levelOfTheEpisode = readPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize
	if (!levelOfTheEpisode)
		throw new MapParseError("Expected level of the episode")

	const mapClimate = readPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	offset += decNumberSize * 3 // three button times here; all unused

	const mapTimeSeconds = readPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	offset += decNumberSize // unused extra piece of data

	const backgroundMovementType = readPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	const playerSpriteId = mustReadPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	const mapOnMapX = mustReadPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	const mapOnMapY = mustReadPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	const mapOnMapIconId = mustReadPositiveFixedDecimalNumber(
		buffer.slice(offset),
		decNumberSize
	)
	offset += decNumberSize

	return {
		blockPaletteImagePath,
		backgroundImagePath,
		musicFilePath,
		mapName,
		authorName,
		mapTimeSeconds,
		mapOfMap: {
			levelOfTheEpisode,
			x: mapOnMapX,
			y: mapOnMapY,
			iconId: mapOnMapIconId,
		},
		climate: mapClimate as MapClimate,
		backgroundMovementType:
			backgroundMovementType as MapBackgroundMovementType,
		playerSpriteId,
	}
}
