import { LegacyEntityIdTransformerSync } from "@app/game/entity/external/legacy"
import { MapData } from "@app/game/map/defines"

import { LegacyMapData } from "./legacy"

export const mapDataFromLegacy = (
	legacy: LegacyMapData,
	transformer: LegacyEntityIdTransformerSync,
): MapData => {
	const blockIds = [
		...new Set(
			[
				...legacy.body.background.flatMap(v => v).flatMap(v => v),
				...legacy.body.foreground.flatMap(v => v).flatMap(v => v),
			].filter(v => v >= 0),
		).values(),
	]

	return {
		width: legacy.width,
		height: legacy.height,
		name: legacy.mapName,
		author: {
			name: legacy.authorName,
		},

		backgroundBlocks: legacy.body.background,
		foregroundBlocks: legacy.body.foreground,

		backgroundImageUrl: transformer.transformScenery(
			legacy.backgroundImagePath,
		),
		blockData: Object.fromEntries(
			blockIds.map(v => [v, transformer.resolveBlockData(v)]),
		),
		prePlacedEntities: legacy.body.sprites.flatMap((entries, x) =>
			entries.map((v, y) => ({
				x,
				y,
				entityData: transformer.resolveEntityData(legacy.prototypes[v]),
			})),
		),
	}
}
