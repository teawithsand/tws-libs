import { Point } from "./point"

export const pointSegmentDistance = (
	p: Readonly<Point>,
	segment: Readonly<[Readonly<Point>, Readonly<Point>]>,
) => {
	const [x, y] = p
	const [[x1, y1], [x2, y2]] = segment

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

export const euclideanDistance = (...points: Point[]) => {
	if (points.length <= 1) return 0

	let prev = points[0]
	let agg = 0
	for (const p of points.slice(1)) {
		const d = Math.sqrt((prev[0] - p[0]) ** 2 + (prev[1] - p[1]) ** 2)
		agg += d
		prev = p
	}

	return agg
}

export const manhattanDistance = (...points: Point[]) => {
	if (points.length <= 1) return 0

	let prev = points[0]
	let agg = 0
	for (const p of points.slice(1)) {
		const d = Math.abs(prev[0] - p[0]) + Math.abs(prev[1] - p[1])
		agg += d
		prev = p
	}

	return agg
}
