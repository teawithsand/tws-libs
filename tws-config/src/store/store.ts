/**
 * Config storage responsible for storing any type of config.
 */
export interface ConfigStore<T extends Record<string, any>> {
	store: (value: T) => Promise<void>
	obtain: () => Promise<T | null>
	clear: () => Promise<void>
}
