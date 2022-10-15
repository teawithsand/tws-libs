import { LegacyEntityData } from "@app/game/entity/external/defines"
import { BlockId } from "../map"

/**
 * Manager, which manages resources for specified instance of game map.
 */
export interface ResourceLoader {
	readonly backgroundColor?: string // color of background, defaults to white
	readonly backgroundImageUrl?: string // URL of background image, if any

	foregroundBlockImageUrl(id: BlockId): string
	backgroundBlockImageUrl(id: BlockId): string
	loadLegacyEntityDataForName(name: string): LegacyEntityData
}
