import { Rect } from "@app/util/geometry"

export type CollisionShape = Rect

export enum CollisionDirection {
	TOP = 1,
	BOTTOM = 2,
	LEFT = 3,
	RIGHT = 4,
}
