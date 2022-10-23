import { throwExpression } from "@teawithsand/tws-stl"

import { LegacyEntityIdTransformerSync } from "@app/game/entity/external/legacy"
import { mapDataFromLegacy, parseLegacyMap } from "@app/game/map"
import { GameResources, LegacyResourceLoader } from "@app/game/resources/res"

export class GatsbyResourceLoader implements LegacyResourceLoader {
	readonly legacyEpisodes: string[]
	readonly legacyEpisodesMaps: {
		[key: string]: string[]
	}

	private readonly transformer: LegacyEntityIdTransformerSync = {
		// TODO(teawithsand): implement it
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
		const mapData = mapDataFromLegacy(legacyMapData, this.transformer)

		/*
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
		 */

		return {
			map: mapData,
		}
	}
}
