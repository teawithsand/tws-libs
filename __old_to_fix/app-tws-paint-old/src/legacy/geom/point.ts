export const POINT_X = 0
export const POINT_Y = 1

export type Point = [number, number]

export const pointTranslate = (
	p: Readonly<Point>,
	...vec: Readonly<Point>[]
): Point => {
	let copiedPoint: Point = [...p]
	for (const v of vec) {
		copiedPoint = [copiedPoint[0] + v[0], copiedPoint[1] + v[1]]
	}
	return copiedPoint
}
