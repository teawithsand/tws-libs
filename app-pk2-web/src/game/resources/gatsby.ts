import { throwExpression } from "@teawithsand/tws-stl"

import { parseLegacyEntityData } from "@app/game/entity/external/legacy"
import {
	MapData,
	mapDataFromLegacy,
	parseLegacyMap,
	PrePlacedEntity,
} from "@app/game/map"
import { GameResources, LegacyResourceLoader } from "@app/game/resources/res"

export class GatsbyResourceLoader implements LegacyResourceLoader {
	readonly legacyEpisodes: string[]
	readonly legacyEpisodesMaps: {
		[key: string]: string[]
	}

	constructor(private readonly rawResources: Queries.ResourceFilesQuery) {
		this.legacyEpisodes = [
			...new Set(
				rawResources.allFile.nodes
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
				rawResources.allFile.nodes
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

	private get res() {
		return this.rawResources.allFile.nodes
	}

	loadLegacyGameResources = async (
		epName: string,
		mapFileName: string,
	): Promise<GameResources> => {
		const mapFilePath = `episodes/${epName}/${mapFileName}`

		const mapFileUrl =
			(
				this.res.find(p => p.relativePath === mapFilePath) ??
				throwExpression(new Error("such map does not exist"))
			).publicURL ??
			throwExpression(
				new Error(`Map file ${mapFilePath} does not have public URL`),
			)

		const mapBuffer = await (
			await (await fetch(mapFileUrl)).blob()
		).arrayBuffer()

		const legacyMapData = parseLegacyMap(mapBuffer)
		const almostMapData = mapDataFromLegacy(legacyMapData)

		const backgroundImageUrl =
			this.res.find(
				v =>
					v.relativePath ===
					`scenery/${legacyMapData.backgroundImagePath.replace(
						".bmp",
						".png",
					)}`,
			)?.publicURL ??
			throwExpression(
				new Error(
					`Background image with path ${legacyMapData.backgroundImagePath} was not found`,
				),
			)

		const prePlacedEntities: PrePlacedEntity[] = []
		for (const e of almostMapData.prePlacedEntities) {
			const url =
				this.res.find(
					v => v.relativePath === "models/data/" + e.reference,
				)?.publicURL ??
				throwExpression(
					new Error(
						`There is no entity file registered for ${e.reference}`,
					),
				)

			// Let's just assume that HTTP cache is there and I do not have to cache it by hand
			const buffer = await (await (await fetch(url)).blob()).arrayBuffer()
			const legacyEntityData = parseLegacyEntityData(buffer)

			throw new Error("NIY")
			// TODO(teawithsand): port that legacy entity data into new entity data and push it to prePlacedEntities
		}

		const mapData: MapData = {
			width: almostMapData.width,
			height: almostMapData.height,
			backgroundBlocks: almostMapData.backgroundBlocks,
			backgroundImageUrl,
			blockData: almostMapData.blockData,
			foregroundBlocks: almostMapData.foregroundBlocks,
			prePlacedEntities,
		}

		return {
			map: mapData,
		}
	}
}
