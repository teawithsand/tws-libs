import { Color } from "@app/legacy/color"
import { Point } from "@app/legacy/geom"

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
