import { getStroke, StrokeOptions } from "perfect-freehand"
import React, { useMemo } from "react"

import { useRegisterInBBoxRegistry } from "@app/components/paint/render/bbox"
import { InnerSVGElementRendererProps } from "@app/components/paint/render/svg/SVGElementRenderer"
import {
	PaintElementType,
	renderElementTransformAndFilter,
} from "@app/domain/paint/defines"

import { encodeColor } from "@app/legacy/color"

function getSvgPathFromStroke(stroke: ReturnType<typeof getStroke>) {
	if (!stroke.length) return ""

	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length]
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
			return acc
		},
		["M", ...stroke[0], "Q"],
	)

	d.push("Z")
	return d.join(" ")
}

export const SVGBrushPathElementRenderer = (
	props: InnerSVGElementRendererProps<PaintElementType.HAND_DRAWN_PATH>,
) => {
	const { element, onPointerEnter, onClick, layerIndex, elementIndex } = props

	const { points, stroke, commonOptions } = element
	const {
		local: {
			removal: { isMarkedForRemoval = false },
		},
		filters,
	} = commonOptions

	const pathString = useMemo(() => {
		const options: StrokeOptions = {
			simulatePressure: true,
			size: stroke.size,
			// Just use sin ease-out, like excalidraw uses
			// It seems to work ok.
			easing: (t: number) => Math.sin((t * Math.PI) / 2),
			last: false,
		}

		return getSvgPathFromStroke(getStroke(points, options))
	}, [points, stroke.size])

	const renderedFilters = useMemo(
		() => renderElementTransformAndFilter(element.commonOptions),
		[isMarkedForRemoval, filters],
	)

	const style = useMemo(() => {
		const res: React.CSSProperties = {}

		res.fill = encodeColor(stroke.color)
		res.stroke = encodeColor(stroke.color)
		res.strokeWidth = 1
		res.strokeLinecap = stroke.lineCap
		res.strokeLinejoin = stroke.lineJoin

		return {
			...res,
			...renderedFilters,
		}
	}, [stroke, renderedFilters])

	const setBBoxRef = useRegisterInBBoxRegistry(layerIndex, elementIndex, [
		style,
		renderedFilters,
		pathString,
	])

	// skip rendering of invisible elements
	// on bottom most level
	// to prevent loss of useMemoed stuff
	if ((element.commonOptions.visible ?? true) === false) {
		return <></>
	}

	return (
		<path
			ref={setBBoxRef}
			onClick={onClick}
			onPointerEnter={onPointerEnter}
			d={pathString}
			style={style}
		/>
	)
}
