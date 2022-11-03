import { CollisionShape } from "@app/game/entity/collisionWorld"
import { Vec2 } from "@app/util/vector"

export type CollisionMapResult = {
	type: "shift"
	finalShift: Vec2
}

export interface CollisionMap {
	/**
	 * For given collision shape and velocity vector, returns final shift vector that one is supposed to go to.
	 * It handles climbing.
	 */
	getMapCollision(shape: CollisionShape, shift: Vec2): CollisionMapResult
}

export class CollisionMapImpl implements CollisionMap {
	getMapCollision = (
		shape: CollisionShape,
		shift: Vec2,
	): CollisionMapResult => {
		return {
			type: "shift",
			finalShift: shift,
		}
	}
}
