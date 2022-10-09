import { Color } from "@app/legacy/color"
import { Point } from "@app/legacy/geom"

export type PathLineCapType = "butt" | "square" | "round"
export type PathLineJoinType = "miter" | "round" | "bevel"

export type PathStrokeData = {
	color: Color
	size: number
	lineCap: PathLineCapType
	lineJoin: PathLineJoinType
	fill: Color | null
}

export type HandDrawnPathPaintElement = {
	stroke: PathStrokeData
	points: Point[] | [...Point, number][]
}
