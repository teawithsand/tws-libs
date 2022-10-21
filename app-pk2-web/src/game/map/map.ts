import { AlmostMapData } from "@app/game/map/defines"

import { LegacyMapData } from "./legacy"

export const mapDataFromLegacy = (legacy: LegacyMapData): AlmostMapData => {
	// TODO(teawithsand): implement it
	throw new Error("NIY")
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
