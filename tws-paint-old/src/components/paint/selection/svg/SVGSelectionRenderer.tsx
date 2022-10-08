import React, { forwardRef, Ref, useMemo } from "react";



import { useElementDisplayBBoxRegistry } from "@app/components/paint/render/bbox";
import { SelectionRendererProps } from "@app/components/paint/selection/SelectionRenderer";
import { PaintElement } from "@app/domain/paint/defines";
import { useCurrentPaintSnapshotSelector, usePaintSelector, usePointOperations } from "@app/domain/paint/redux/selector";



import { useSubscribable } from "tws-common/event-bus";
import { NORM_RECT_MIN, Point, Rect, rectDimensions, rectNormalize } from "tws-common/geometry";


const SelectionBoundingBox = (props: {
	layerIndex: number
	elementIndex: number
	element: PaintElement
}) => {
	const boundingBoxManager = useElementDisplayBBoxRegistry()

	const sub = boundingBoxManager.bBoxSubscribable(
		props.layerIndex,
		props.elementIndex,
	)
	const initialValue = useMemo(
		() => sub.getBBox(),
		[boundingBoxManager, props.layerIndex, props.elementIndex],
	)
	const canvasCoordsBox = useSubscribable(sub, initialValue)

	const ops = usePointOperations()

	if (!canvasCoordsBox) {
		return <></>
	}

	const screenBox: Rect = [
		ops.canvasPointToScreenPoint(canvasCoordsBox[0]),
		ops.canvasPointToScreenPoint(canvasCoordsBox[1]),
	]

	const normalizedBox = rectNormalize(screenBox)
	const dimensions = rectDimensions(normalizedBox)

	const growFactor = 10
	const dashSize = 10
	return (
		<rect
			x={0}
			y={0}
			width={dimensions.width + growFactor * 2}
			height={dimensions.height + growFactor * 2}
			style={{
				transform: `translateX(${
					normalizedBox[NORM_RECT_MIN][0] - growFactor
				}px) translateY(${
					normalizedBox[NORM_RECT_MIN][1] - growFactor
				}px)`,
				fill: "transparent",
				stroke: "black",
				strokeWidth: 2,
				strokeDasharray: `${new Array(4)
					.fill(dashSize)
					.map(v => v.toString())
					.join(" ")}`,
			}}
		/>
	)
}

const SelectionDragBox = (props: { box: Rect | null }) => {
	const { box: canvasCoordsBox } = props
	const ops = usePointOperations()

	if (!canvasCoordsBox) return <></>

	const screenBox: Rect = [
		ops.canvasPointToScreenPoint(canvasCoordsBox[0]),
		ops.canvasPointToScreenPoint(canvasCoordsBox[1]),
	]

	const normalizedBox = rectNormalize(screenBox)
	const dimensions = rectDimensions(normalizedBox)

	const growFactor = 0
	const dashSize = 10

	return (
		<rect
			x={0}
			y={0}
			width={dimensions.width + growFactor * 2}
			height={dimensions.height + growFactor * 2}
			style={{
				transform: `translateX(${
					normalizedBox[NORM_RECT_MIN][0] - growFactor
				}px) translateY(${
					normalizedBox[NORM_RECT_MIN][1] - growFactor
				}px)`,
				fill: "rgba(38, 0, 255, 0.527)",
				stroke: "black",
				strokeWidth: 2,
				strokeDasharray: `${new Array(4)
					.fill(dashSize)
					.map(v => v.toString())
					.join(" ")}`,
			}}
		/>
	)
}

const InnerRenderer = (
	props: SelectionRendererProps,
	ref: Ref<SVGSVGElement | null>,
) => {
	const { scene, screenWidth: presentationWidth, screenHeight: presentationHeight, style, className } =
		props

	const currentSelectionBox = usePaintSelector(
		s => s.actionsState.currentSelectionDragBox,
	)

	const selectedElements = useMemo(() => {
		return scene.layers
			.map((layer, layerIndex) =>
				layer.elements.map((element, elementIndex) => ({
					layerIndex,
					elementIndex,
					element,
				})),
			)
			.flat(1)
			.filter(e => e.element.commonOptions.local.selection.isSelected)
	}, [scene, scene.layers])

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={presentationWidth}
			height={presentationHeight}
			style={{
				...style,
			}}
			className={className}
			viewBox={`0 0 ${presentationWidth} ${presentationHeight}`}
			onDragStart={e => {
				e.preventDefault()
				return false
			}}
			onDrag={e => {
				e.preventDefault()
				return false
			}}
			ref={ref}
		>
			{/* TODO(teawithsand): better keys here for good performance for large amount of selected objects. 
			Preferably use IDs of elements or sth like that */}
			{selectedElements.map((v, i) => (
				<SelectionBoundingBox {...v} key={i} />
			))}

			<SelectionDragBox box={currentSelectionBox} />
		</svg>
	)
}

export const SVGSelectionRenderer = forwardRef(InnerRenderer)