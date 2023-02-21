import { ConfigStore } from "./store"

// Makes TS happy; should be left
import LocalForage from "localforage"

/**
 * Simple ConfigStore, which uses localForage as internal driver.
 */
export class LocalForageConfigStore<T extends Record<any, string>>
	implements ConfigStore<T>
{
	constructor(
		private readonly forage: LocalForage,
		public readonly key: string
	) {}

	store = async (value: T): Promise<void> => {
		await this.forage.setItem(this.key, value)
	}
    
	obtain = async (): Promise<T | null> => {
		return (await this.forage.getItem(this.key)) ?? null
	}

	clear = async () => {
		await this.forage.removeItem(this.key)
	}
}
