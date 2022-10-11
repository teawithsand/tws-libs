import { BlockStaticDefinition } from "./block"
import { LegacyMapData } from "./legacy"

export type TileId = number
export type SpriteId = number

export type MapHeader = {
	width: number
	height: number

	authorName: string
	mapName: string
}

export type MapBody = {
	foreground: BlockStaticDefinition[][]
	background: BlockStaticDefinition[][]
}

/**
 * Map data parsed from file. Does not implement any dynamic data.
 */
export type MapData = {
	body: MapBody
	header: MapHeader
}

export const updateFromLegacy = (legacy: LegacyMapData): MapData => {
	throw new Error("NIY")
	/*
	return {
		header: {
			width: legacy.width,
			height: legacy.height,
			authorName: legacy.authorName,
			mapName: legacy.mapName,
		},
		body: {

		},
	}
	*/
}
