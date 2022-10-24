import { Point, PointLike } from "@app/util/geometry"

/**
 * Any two dimensional vector.
 */
export class Vec2 {
	constructor(public readonly x: number, public readonly y: number) {}

	static fromPointLike(pl: PointLike): Vec2 {
		const p = new Point(pl)
		return new Vec2(p.x, p.y)
	}
	static zero() {
		return new Vec2(0, 0)
	}

	/**
	 * Returns length of this vector.
	 */
	get length() {
		return Math.sqrt(this.x ** 2 + this.y ** 2)
	}

	/**
	 * Vector with same direction of length equal to 1.
	 */
	get normalized(): Vec2 {
		return new Vec2(this.x / this.length, this.y / this.length)
	}

	/**
	 * Cast this vector to 2d point.
	 */
	get asPoint(): Point {
		return new Point([this.x, this.y])
	}

	addVec = (rhs: Vec2): Vec2 => new Vec2(this.x + rhs.x, this.y + rhs.y)

	addScalar = (rhs: number): Vec2 => new Vec2(this.x + rhs, this.y + rhs)

	mulVec = (rhs: Vec2): Vec2 => new Vec2(this.x * rhs.x, this.y * rhs.y)
	mulScalar = (rhs: number): Vec2 => new Vec2(this.x * rhs, this.y * rhs)
}
