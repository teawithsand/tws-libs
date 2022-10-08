import { Color } from "tws-common/color"
import { Point } from "tws-common/geometry/point"

export type TextPaintElement = {
	text: string
	color: Color
	startPoint: Point

	dominantBaseline:
		| "auto"
		| "text-bottom"
		| "alphabetic"
		| "ideographic"
		| "middle"
		| "central"
		| "mathematical"
		| "hanging"
		| "text-top"

	fontName: string
	fontSize: string | number
}
