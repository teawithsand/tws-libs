import { graphql, useStaticQuery } from "gatsby"

import { throwExpression } from "@app/../../tws-stl/dist"
import { ExternalEntityData } from "@app/game/entity/external/data"

import { ResourceLoader } from "./res"

/**
 * Resource loader, which uses gatsby resources file source in order to provide all in-game assets.
 */
export class GatsbyResourceLoader implements ResourceLoader {
	private readonly blockMap: Map<number, string> = new Map()
	constructor(
		private readonly rawResources: Queries.ResourceFilesQuery,
		tileSetName: string,
		public readonly backgroundColor?: string | undefined,
		public readonly backgroundImageUrl?: string | undefined,
	) {
		const m = this.blockMap // fixme

		for (let i = 0; i < 255; i++) {
			const res = rawResources.allFile.nodes.find(
				v =>
					v.relativePath ===
					`blocks/${tileSetName}/${String(i).padStart(3, "0")}.png`,
			)

			if (res && res.publicURL) {
				m.set(i, res.publicURL)
			}
		}
	}

	foregroundBlockImageUrl(id: number): string {
		return (
			this.blockMap.get(id) ??
			throwExpression(new Error("no block with such id"))
		)
	}

	backgroundBlockImageUrl(id: number): string {
		return (
			this.blockMap.get(id) ??
			throwExpression(new Error("no block with such id"))
		)
	}

	loadExternalEntityDataForName(name: string): ExternalEntityData {
		throw new Error("Method not implemented.")
	}
}
