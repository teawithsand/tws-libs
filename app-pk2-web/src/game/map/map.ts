import { LegacyMapData } from "./legacy"

export type BlockId = number
export type SpriteId = number

export type MapHeader = {
	width: number
	height: number

	authorName: string
	mapName: string
}

export type MapBody = {
	foreground: BlockId[][]
	background: BlockId[][]
}

/**
 * Map data parsed from file. Does not implement any dynamic data.
 */
export type MapData = {
	body: MapBody
	header: MapHeader
}

export const mapDataFromLegacy = (legacy: LegacyMapData): MapData => {
	return {
		header: {
			width: legacy.width,
			height: legacy.height,
			authorName: legacy.authorName,
			mapName: legacy.mapName,
		},
		body: {
			background: legacy.body.background,
			foreground: legacy.body.foreground,
		},
	}
}
