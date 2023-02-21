import { ConfigStore } from "./store"

/**
 * Non-persistent config store. Used for debugging and testing.
 */
export class InMemoryConfigStore<T extends Record<string, any>>
	implements ConfigStore<T>
{
	private value: T | null = null
	constructor(initValue: T | null = null) {
		this.value = initValue
	}

	store = async (value: T): Promise<void> => {
		this.value = value
	}

	obtain = async (): Promise<T | null> => {
		return this.value
	}

	clear = async () => {
		this.value = null
	}
}
