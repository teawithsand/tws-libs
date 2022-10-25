import { release } from "os"

import { Entity } from "@app/game/entity/manager/entity"
import { BLOCK_HEIGHT, BLOCK_WIDTH, BlockCollisionData } from "@app/game/map"
import { SpatialHashMap } from "@app/util/ds/spatialMap"
import { Point, Rect } from "@app/util/geometry"
import { Vec2 } from "@app/util/vector"

export type CollisionShape =
	| {
			type: "rect"
			rect: Rect
	  }
	| {
			type: "matrix"
			point: Point
			matrix: BlockCollisionData
	  }

export type CollisionWorldClientOptions = {
	entity: Entity
	shape: CollisionShape
}

export class CollisionWorld {
	// OFC in units per tick.
	public readonly gravityVector = new Vec2(0, -3)

	// Cell size can be tweaked for performance.
	public readonly entitySpatialMap = new SpatialHashMap<Entity>(
		BLOCK_WIDTH,
		BLOCK_HEIGHT,
	)

	newClient = (options: { entity: Entity; shape: CollisionShape }) => {
		const { entity } = options
		let { shape } = options
		
		return {
			setCollisionShape: (shape: CollisionShape) => {},
			getCollision: () => {}
			release: () => {},
		}
	}
}
