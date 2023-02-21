/**
 * Config storage responsible for storing any type of config.
 */
export interface ConfigStore<T extends Record<any, string>> {
	store: (value: T) => Promise<void>
	obtain: () => Promise<T | null>
	clear: () => Promise<void>
}
