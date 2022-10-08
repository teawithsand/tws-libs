import { Point, pointTranslate } from "../point"
import { Rect } from "./define"

export const NORM_RECT_MIN = 0
export const NORM_RECT_MAX = 1

/**
 * Normalizes rectangle provided.
 */
export const rectNormalize = (rect: Readonly<Rect>): Rect => {
	const [[x1, y1], [x2, y2]] = rect

	return [
		[Math.min(x1, x2), Math.min(y1, y2)],
		[Math.max(x1, x2), Math.max(y1, y2)],
	]
}

export const rectTranslate = (rect: Readonly<Rect>, ...vec: Point[]) => {
	const rectCopy: Rect = [[...rect[0]], [...rect[1]]]
	for (const v of vec) {
		rectCopy[0] = pointTranslate(rectCopy[0], v)
		rectCopy[1] = pointTranslate(rectCopy[1], v)
	}

	return rectCopy
}

export const rectDimensions = (
	rect: Readonly<Rect>,
): {
	width: number
	height: number
} => {
	const width = Math.abs(rect[0][0] - rect[1][0])
	const height = Math.abs(rect[0][1] - rect[1][1])

	return {
		width,
		height,
	}
}

/**
 * Returns are, which given rectangle occupies.
 */
export const rectArea = (rect: Readonly<Rect>) => {
	const { width, height } = rectDimensions(rect)
	return width * height
}

/**
 * Creates zero sized rectangle from point.
 */
export const pointRect = (point: Readonly<Point>): Rect => [
	[...point],
	[...point],
]

/**
 * Grows rectangle by specified size.
 */
export const rectGrow = (rect: Readonly<Rect>, by: number): Rect => {
	rect = rectNormalize(rect)

	return rectNormalize([
		[rect[NORM_RECT_MIN][0] - by, rect[NORM_RECT_MIN][1] - by],
		[rect[NORM_RECT_MAX][0] + by, rect[NORM_RECT_MAX][1] + by],
	])
}

/**
 * Returns true, if given rectangle contains specified point.
 */
export const rectContainsPoint = (
	rect: Readonly<Rect>,
	p: Readonly<Point>,
	bordersAllowed = true,
) => {
	rect = rectNormalize(rect)
	if (
		bordersAllowed &&
		rect[NORM_RECT_MAX][0] >= p[0] &&
		rect[NORM_RECT_MAX][1] >= p[1] &&
		rect[NORM_RECT_MIN][0] <= p[0] &&
		rect[NORM_RECT_MIN][1] <= p[1]
	) {
		return true
	} else if (
		rect[NORM_RECT_MAX][0] > p[0] &&
		rect[NORM_RECT_MAX][1] > p[1] &&
		rect[NORM_RECT_MIN][0] < p[0] &&
		rect[NORM_RECT_MIN][1] < p[1]
	) {
		return true
	} else {
		return false
	}
}

/**
 * Returns rectangle created from intersection of rectangles given.
 * Returns null if rectangles have no intersection.
 */
export const rectIntersection = (
	baseRect: Readonly<Rect>,
	...rects: Readonly<Rect>[]
): Rect | null => {
	let current = rectNormalize(baseRect)
	for (let rect of rects) {
		rect = rectNormalize(rect)

		if (
			!rectContainsPoint(rect, current[NORM_RECT_MIN]) &&
			!rectContainsPoint(rect, current[NORM_RECT_MAX])
		) {
			return null // no intersection
		}

		let x1 = Math.max(rect[NORM_RECT_MIN][0], current[NORM_RECT_MIN][0])
		let x2 = Math.min(rect[NORM_RECT_MAX][0], current[NORM_RECT_MAX][0])
		;[x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)]
		let y1 = Math.max(rect[NORM_RECT_MIN][1], current[NORM_RECT_MIN][1])
		let y2 = Math.min(rect[NORM_RECT_MAX][1], current[NORM_RECT_MAX][1])
		;[y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)]

		current = rectNormalize([
			[x1, y1],
			[x2, y2],
		])
	}

	return current
}

/**
 * Computes offsets, which once they are added to rectangle edges,
 * transform source rectangle into destination rectangle.
 */
export const rectTransformOffsets = (
	sourceRect: Readonly<Rect>,
	destRect: Readonly<Rect>,
) => {
	sourceRect = rectNormalize(sourceRect)
	destRect = rectNormalize(destRect)

	return {
		left: destRect[NORM_RECT_MIN][0] - sourceRect[NORM_RECT_MIN][0],
		right: destRect[NORM_RECT_MAX][0] - sourceRect[NORM_RECT_MAX][0],
		bottom: destRect[NORM_RECT_MIN][1] - sourceRect[NORM_RECT_MIN][1],
		top: destRect[NORM_RECT_MAX][1] - sourceRect[NORM_RECT_MAX][1],
	}
}

/**
 * Just like rectTransformOffsets, but:
 * - returns positive number when source rectangle, once applied transformation, will have given edge's length increased by that number
 * - returns negative number when source rectangle, once applied transformation, will have given edge's length decreased by that number
 */
export const rectTransformDistances = (
	sourceRect: Readonly<Rect>,
	destRect: Readonly<Rect>,
) => {
	sourceRect = rectNormalize(sourceRect)
	destRect = rectNormalize(destRect)

	const data = rectTransformOffsets(sourceRect, destRect)
	return {
		...data,
		left: -data.left,
		bottom: -data.bottom,
	}
}
