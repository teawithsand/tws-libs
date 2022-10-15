import { EntityEnvironment } from "@app/game/entity/environment"

/**
 * This is just for now. In future this will be more specific in order to support downcasting.
 */
export type AnyEntity = Entity

/**
 * Entity, which has it's environment and is initialized.
 */
export interface Entity {
	/**
	 * In current rendering model this delta time will be constant. It's amount of ticks, always set to one.
	 */
	update(
		env: EntityEnvironment,
		deltaTicks: number,
	): {
		isDead: boolean
	}

	release(): void
}
