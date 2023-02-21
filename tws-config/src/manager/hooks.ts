import { throwExpression } from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import { ConfigManager, ConfigUpdater } from "./manager"

/**
 * Fetches config form ConfigManager.
 *
 * This hook uses suspense and errorBoundary. Make sure you have provided them in top-level components.
 */
export const useConfig = <T extends {}>(cm: ConfigManager<T>): T => {
	let status = 0
	let error
	const config = useStickySubscribable(cm.configBus)
	const promise = useStickySubscribable(cm.loadedPromiseBus).then(
		() => {
			status = 1
		},
		(e) => {
			status = -1
			error = e
		}
	)

	if (status === 0) {
		throw promise
	} else if (status === -1) {
		throw error
	} else {
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
}

/**
 * Fetches config form ConfigManager. If it is not loaded, returns default one.
 */
export const useConfigOrDefault = <T extends {}>(cm: ConfigManager<T>): T => useStickySubscribable(cm.defaultConfigBus)

/**
 * Returns config updater, that is capable of updating configs. In other words it has config loaded.
 *
 * This hook uses suspense and errorBoundary. Make sure you have provided them in top-level components.
 */
export const useConfigUpdater = <T extends {}>(
	cm: ConfigManager<T>
): ConfigUpdater<T> => {
	let status = 0
	let error
	const promise = useStickySubscribable(cm.loadedPromiseBus).then(
		() => {
			status = 1
		},
		(e) => {
			status = -1
			error = e
		}
	)

	if (status === 0) {
		throw promise
	} else if (status === -1) {
		throw error
	} else {
		return cm
	}
}
