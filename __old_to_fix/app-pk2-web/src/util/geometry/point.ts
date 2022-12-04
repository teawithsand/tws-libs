import { Vec2 } from "@app/util/vector"

export type PointLike =
	| [number, number]
	| {
			x: number
			y: number
	  }
	| Point

export class Point {
	public readonly x: number
	public readonly y: number

	get 0() {
		return this.x
	}
	get 1() {
		return this.y
	}
	constructor(p?: PointLike) {
		p = p ?? [0, 0]
		if (p instanceof Array) {
			this.x = p[0]
			this.y = p[1]
		} else {
			this.x = p.x
			this.y = p.y
		}
	}

	equals(p: Point) {
		return this.x === p.x && this.y === p.y
	}

	toJSON() {
		return this.toArray()
	}

	toArray(): [number, number] {
		return [this.x, this.y]
	}

	toString() {
		return `(${this.x},${this.y})`
	}

	translated = (...points: (Point | Vec2)[]) => {
		return new Point(
			[this, ...points].reduce(
				(prev, current) =>
					new Point([prev.x + current.x, prev.y + current.y]),
			),
		)
	}

	euclideanDistance = (...points: Point[]): number => {
		let d = 0

		let prevPoint: Point = this
		for (const p of points) {
			d += Math.sqrt((prevPoint.x - p.x) ** 2 + (prevPoint.y - p.y) ** 2)
			prevPoint = p
		}

		return d
	}

	manhattanDistance = (...points: Point[]): number => {
		let d = 0

		let prevPoint: Point = this
		for (const p of points) {
			d += Math.abs(prevPoint.x - p.x) + Math.abs(prevPoint.y - p.y)
			prevPoint = p
		}

		return d
	}

	/**
	 * Returns distance of this point from segment defined by these two points.
	 */
	segmentDistance = (segment: [Point, Point]): number => {
		const [x, y] = this.toArray()
		const [[x1, y1], [x2, y2]] = segment.map(p => p.toArray())

		const A = x - x1
		const B = y - y1
		const C = x2 - x1
		const D = y2 - y1

		const dot = A * C + B * D
		const len_sq = C * C + D * D
		let param = -1
		if (len_sq != 0)
			//in case of 0 length line
			param = dot / len_sq

		let xx, yy
		if (param < 0) {
			xx = x1
			yy = y1
		} else if (param > 1) {
			xx = x2
			yy = y2
		} else {
			xx = x1 + param * C
			yy = y1 + param * D
		}

		const dx = x - xx
		const dy = y - yy
		return Math.sqrt(dx ** 2 + dy ** 2)
	}
}
