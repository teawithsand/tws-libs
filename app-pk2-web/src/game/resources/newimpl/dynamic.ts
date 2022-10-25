import { EntityData } from "@app/game/entity/external/data"
import { LegacyEntityIdTransformerSync } from "@app/game/entity/external/legacy"
import { BlockData, MapData } from "@app/game/map"
import { GatsbyResourcesUtil } from "@app/game/resources/managed"
import { Rect } from "@app/util/geometry"

export interface Resources {
	readonly backgroundImageUrl: string
	readonly foregroundURL: string // typically these are same
	readonly backgroundURL: string // typically these are same
	readonly mapData: MapData

	getBlockBackgroundUrl(n: number): string
	getBlockForegroundUrl(n: number): string
}

export interface ResourceLoader {
	loadResources(mapIndex: number): Promise<Resources>
}

export class GatsbyResourceTranslator implements LegacyEntityIdTransformerSync {
	constructor(private readonly resUtil: GatsbyResourcesUtil) {}

	transformSoundId(id: string): string {
		return this.resUtil.queryPathSegments(["music", id], [".xm", ".mp3"])
	}
	transformMasterEntitySpritesFile(id: string): string {
		return this.resUtil.queryPathSegments(["models", "data", id])
	}
	transformScenery(id: string): string {
		return this.resUtil.queryPathSegments(["scenery", id], [".bmp", ".png"])
	}
	resolveEntityData(id: string): EntityData {
		throw new Error("Method not implemented.")
	}
	resolveBlockData(n: number): BlockData {
		throw new Error("Method not implemented.")
	}
}

export class GatsbyResourceLoader implements ResourceLoader {
	constructor(private readonly resUtil: GatsbyResourcesUtil) {}

	private load = async (u: string): Promise<ArrayBuffer> => {
		return await (await fetch(u)).arrayBuffer()
	}

	loadResources = async (mapIndex: number): Promise<Resources> => {}
}
