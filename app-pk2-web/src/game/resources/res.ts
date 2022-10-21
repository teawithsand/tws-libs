import { MapData } from "../map"

/**
 * Game resources for specific map.
 * Loaded once per map/game. Map picker/menus are done outside game model.
 *
 *
 * Note: it may contain URLs/lazy load parts.
 * It's generally everything needed to launch a game, not necessarily run it.
 *
 * Some URL preloading may be part of initialization, while doing it.
 * It should be easy with service worker/gatsby-plugin-offline.
 * A bit harder for not-gatsby managed URLs, which will be supported in future.
 */
export interface GameResources {
	readonly map: MapData
}

/**
 * Manager, which manages resources for specified instance of game map.
 */
export interface LegacyResourceLoader {
	/**
	 * Note: This could be sync, but it'd require to embed all/most of assets in js, which is not what I want.
	 * I want to be able to fetch stuff like map data and entity stuff during this call, while showing user loading screen or sth like that.
	 */
	loadLegacyGameResources(
		epName: string,
		mapFileName: string,
	): Promise<GameResources>
}
