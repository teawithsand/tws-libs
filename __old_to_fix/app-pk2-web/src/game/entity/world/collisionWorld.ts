import { DefaultEventBus, Subscribable } from "@teawithsand/tws-stl"

import { CollisionShape } from "@app/game/entity/collisionWorld"
import { Entity } from "@app/game/entity/manager/entity"
import { CollisionDirection } from "@app/game/entity/world/collision"
import { Rect } from "@app/util/geometry"
import { Vec2 } from "@app/util/vector"

export type CollisionWorldClient = {
	release(): void
	doMove(vec: Vec2): void
}

export type CollisionWorldCollisionEntity = {
	entity: Entity
	direction: CollisionDirection | null // null if by placement
}

export type CollisionWorldCollision = {
	entities: [CollisionWorldCollisionEntity, CollisionWorldCollisionEntity]
}

export interface CollisionWorld {
	readonly collisions: Subscribable<CollisionWorldCollision>
	getClient(shape: CollisionShape): CollisionWorldClient
}

export class CollisionWorldImpl implements CollisionWorld {
	private innerCollisionsBus = new DefaultEventBus<CollisionWorldCollision>()

	get collisions(): Subscribable<CollisionWorldCollision> {
		return this.innerCollisionsBus
	}

	getClient = (shape: CollisionShape): CollisionWorldClient => {
		const rect: Rect = shape

		return {
			doMove: vec => {
                throw new Error("NIY")
				// noop
			},
			release: () => {
                throw new Error("NIY")
				// noop
			},
		}
	}
}
