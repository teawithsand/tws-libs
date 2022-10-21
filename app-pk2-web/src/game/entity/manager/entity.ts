import { generateUUID } from "@teawithsand/tws-stl"

import { EntityData } from "@app/game/entity/external/data"
import { EntityContext } from "@app/game/entity/manager/defines"
import { Point } from "@app/util/geometry"

export abstract class Entity {
	public readonly id = generateUUID()

	abstract init(ctx: EntityContext): void
	abstract tick(
		ctx: EntityContext,
		deltaTimeMs: number,
	):
		| {
				isDead?: boolean
		  }
		| undefined
	abstract release(ctx: EntityContext): void
}

/**
 * Tool, which converts entity data and some other info into in-game loadable entity, which has it's logic.
 */
export interface EntityFactory {
	produceEntity(data: EntityData, coords: Point): Entity
}
