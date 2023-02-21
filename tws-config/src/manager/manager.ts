import { StickySubscribable } from "@teawithsand/tws-stl"
import { Draft } from "immer"

/**
 * Config manager that has stuff already loaded into it.
 */
export type LoadedConfigManager<T extends {}> = ConfigManager<T> & {
	currentConfig: T
	configBus: StickySubscribable<T>
}

export interface ConfigUpdater<T extends {}> {
	updateConfig: (callback: (config: Draft<T>) => void) => void
	setConfig: (config: T) => void
	save: () => Promise<void>
}

/**
 * Config manager. Handles config loading, serialization, deserialization, updating and storing.
 *
 * Note: for most cases, using it with suspense is the most reasonable way make it work with user ui.
 */
export interface ConfigManager<T extends {}> extends ConfigUpdater<T> {
	/**
	 * Default config.
	 */
	readonly defaultConfig: T

	/**
	 * Current config or null if not yet loaded.
	 */
	readonly currentConfig: T | null

	/**
	 * Bus, which contains config or null if it's not yet loaded.
	 */
	readonly configBus: StickySubscribable<T | null>

	/**
	 * Bus, which contains config or default value if it's not yet loaded.
	 */
	readonly defaultConfigBus: StickySubscribable<T>

	/**
	 * Bus of promises. It contains resolved promise when loading succeed, rejected when it failed and pending if loading
	 * was not triggered or it's pending or it's pending due to retry(load was called after previous load finished).
	 */
	readonly loadedPromiseBus: StickySubscribable<Promise<void>>

	/**
	 * Runs config loading. No methods can be called before this one. Sets default config if none was stored till now.
	 */
	load: () => Promise<void>

	/**
	 * Alternative for load. Instructs ConfigManager that loading should be skipped and instead
	 * default config value should be used.
	 */
	skipLoad: () => void

	/**
	 * Bus, which contains config. This method throws if config is not loaded yet.
	 */
	loadedConfigBus: () => StickySubscribable<T>

	/**
	 * Cleans up all resources associated with this config manager.
	 * It's up to user to make sure that config was saved before this call.
	 */
	close: () => void
}
