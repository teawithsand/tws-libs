/**
 * Options passed to goatcounter's call to count method.
 */
export interface CountOptions {
	/**
	 * Path or event name to be used in goatcounter.
	 */
	path?: string
	referrer?: string
	title?: string
	event?: boolean
}

/**
 * Plugin config used in gatsby-config.js/ts
 */
export interface PluginConfig {
	/**
	 * Value for src field of script to load for goatcounter.
	 */
	scriptPath: string

	/**
	 * Value for `data-goatcounter-count`
	 */
	countEndpoint: string

	/**
	 * Object or function, which generates object that will be JSON serialized
	 * to `data-goatcounter-settings`
	 */
	scriptTagSettings?: any | ((arg: { pathname: string }) => any),

	/**
	 * JS to be included directly before goatcounter is included.
	 */
	customizeScript?: string | ((arg: { pathname: string }) => string),
}

/**
 * Thing capable of handling events and sending them to remote stats collector.
 * Usually there is going to be goatcounter at the other end.
 */
export type Counter = (options: CountOptions) => void
