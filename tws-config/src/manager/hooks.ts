import { throwExpression } from "@teawithsand/tws-stl"
import {
	usePromiseSuspense,
	useStickySubscribable,
} from "@teawithsand/tws-stl-react"
import { ConfigManager, ConfigUpdater } from "./manager"

/**
 * Fetches config form ConfigManager.
 *
 * This hook uses suspense and errorBoundary. Make sure you have provided them in top-level components.
 */
export const useConfig = <T extends {}>(cm: ConfigManager<T>): T => {
	const config = useStickySubscribable(cm.configBus)
	usePromiseSuspense(useStickySubscribable(cm.loadedPromiseBus))

	return (
		config ??
		cm.currentConfig ??
		throwExpression(
			new Error(
				`Unreachable code - config not loaded in suspense even though status is set`
			)
		)
	)
}

/**
 * Fetches config form ConfigManager. If it is not loaded, returns default one.
 */
export const useConfigOrDefault = <T extends {}>(cm: ConfigManager<T>): T =>
	useStickySubscribable(cm.defaultConfigBus)

/**
 * Returns config updater, that is capable of updating configs. In other words it has config loaded.
 *
 * This hook uses suspense and errorBoundary. Make sure you have provided them in top-level components.
 */
export const useConfigUpdater = <T extends {}>(
	cm: ConfigManager<T>
): ConfigUpdater<T> => {
	usePromiseSuspense(useStickySubscribable(cm.loadedPromiseBus))

	return cm
}
