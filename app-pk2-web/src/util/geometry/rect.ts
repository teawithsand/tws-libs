import { Point, PointLike } from "./point"

export type RectLike =
	| [number, number, number, number]
	| [PointLike, PointLike]
	| Rect
	| Point

export class Rect {
	public readonly p1: Point
	public readonly p2: Point

	constructor(r?: RectLike) {
		r = r ?? new Point([0, 0])
		if (r instanceof Rect) {
			this.p1 = r.p1
			this.p2 = r.p2
			return
		} else if (r instanceof Point) {
			this.p1 = r
			this.p2 = r
			return
		}

		if (r.length === 4) {
			this.p1 = new Point([r[0], r[1]])
			this.p2 = new Point([r[2], r[3]])
		} else if (r.length === 2) {
			this.p1 = new Point(r[0])
			this.p2 = new Point(r[1])
		} else {
			throw new Error("Invalid rect-like data")
		}
	}

	toArray(): [number, number, number, number] {
		return [this.p1.x, this.p1.y, this.p2.x, this.p2.y]
	}
	toPoints(): [PointLike, PointLike] {
		return [this.p1, this.p2]
	}

	toJSON() {
		return [this.p1.toJSON(), this.p2.toJSON()]
	}

	equals(p: Rect) {
		return this.p1.equals(p.p1) && this.p2.equals(p.p2)
	}

	get normalized(): Rect {
		const [x1, y1, x2, y2] = this.toArray()

		return new Rect([
			[Math.min(x1, x2), Math.min(y1, y2)],
			[Math.max(x1, x2), Math.max(y1, y2)],
		])
	}
	get width(): number {
		return Math.abs(this.p1.x - this.p2.y)
	}

	get height(): number {
		return Math.abs(this.p1.y - this.p2.y)
	}

	get area(): number {
		return this.width * this.height
	}

	get center(): Point {
		return new Point([
			this.p1.x / 2 + this.p2.x / 2,
			this.p1.y / 2 + this.p2.y / 2,
		])
	}

	translated(p: Point) {
		return new Rect([this.p1.translated(p), this.p2.translated(p)])
	}

	grow(by: number) {
		return this.growDirections({
			left: by,
			right: by,
			top: by,
			bottom: by,
		})
	}

	growDirections(directions: {
		left?: number
		right?: number
		top?: number
		bottom?: number
	}) {
		const { left = 0, right = 0, top = 0, bottom = 0 } = directions
		const [x1, y1, x2, y2] = this.normalized.toArray()

		// note: for now this method allows negative grow, which results in non-zero rect in OOB case
		// but this behavior may change in future, so that "negative" rect width/height will become zero
		// at any point that shift may have been performed there

		return new Rect([x1 - left, y1 - top, x2 + right, y2 + bottom])
			.normalized // may not be normalized if some values are negative
	}

	containsPoint(p: Point, bordersAllowed = true) {
		const rect = this.normalized
		if (bordersAllowed) {
			return (
				p.x >= rect.p1.x &&
				p.y >= rect.p1.y &&
				p.x <= rect.p2.x &&
				p.y <= rect.p2.y
			)
		} else {
			return (
				p.x > rect.p1.x &&
				p.y > rect.p1.y &&
				p.x < rect.p2.x &&
				p.y < rect.p2.y
			)
		}
	}

	containsRect(r: Rect): boolean {
		return this.containsPoint(r.p1) && this.containsPoint(r.p2)
	}

	intersection(...rects: Rect[]): Rect | null {
		let current = this.normalized
		for (let rect of rects) {
			rect = rect.normalized

			if (
				!rect.containsPoint(current.p1) &&
				!rect.containsPoint(current.p2)
			) {
				return null
			}

			let x1 = Math.max(rect.p1.x, current.p1.x)
			let x2 = Math.min(rect.p2.x, current.p2.x)
			;[x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)]
			let y1 = Math.max(rect.p1.y, current.p1.y)
			let y2 = Math.min(rect.p2.y, current.p2.y)
			;[y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)]

			current = new Rect([
				[x1, y1],
				[x2, y2],
			]).normalized
		}

		return current
	}

	/**
	 * Computes offsets, which once they are added to rectangle edges,
	 * transform this rectangle into destination rectangle.
	 */
	getTransformOffsets(destRect: Rect) {
		destRect = destRect.normalized
		const norm = this.normalized

		return {
			left: destRect.p1.x - norm.p1.x,
			right: destRect.p2.x - norm.p2.x,
			bottom: destRect.p1.y - norm.p1.y,
			top: destRect.p2.y - norm.p2.y,
		}
	}

	/**
	 * Just like getTransformOffsets, but:
	 * - returns positive number when source rectangle, once applied transformation, will have given edge's length increased by that number
	 * - returns negative number when source rectangle, once applied transformation, will have given edge's length decreased by that number
	 */
	getTransformDistances(destRect: Rect) {
		const offsets = this.getTransformOffsets(destRect)
		return {
			...offsets,
			left: -offsets.left,
			bottom: -offsets.bottom,
		}
	}
}
