import React, { useCallback } from "react"

import { SVGBrushPathElementRenderer } from "@app/components/paint/render/svg/element/SVGBrushPathElementRenderer"
import { PaintElement, PaintElementType } from "@app/domain/paint/defines"
import {
	PaintEventType,
	PaintScreenEventType,
} from "@app/domain/paint/defines/event"
import { usePaintEventBus } from "@app/domain/paint/event"

export type InnerSVGElementRendererProps<T extends PaintElementType> = {
	elementIndex: number
	layerIndex: number
	element: PaintElement & { type: T }
	onClick?: (e: unknown) => void
	onPointerEnter?: (e: unknown) => void
}

const InnerRenderer = (props: {
	element: PaintElement
	layerIndex: number
	elementIndex: number
}) => {
	const { element, layerIndex, elementIndex } = props
	const bus = usePaintEventBus()
	const onClick = useCallback(
		(e: unknown) => {
			bus.emitEvent({
				type: PaintEventType.SCREEN,
				screenEvent: {
					type: PaintScreenEventType.ELEMENT_CLICK,
					elementIndex,
					layerIndex,
					event: (e as any).nativeEvent,
				},
			})
		},
		[layerIndex, elementIndex, bus],
	)

	const onPointerEnter = useCallback(
		(e: unknown) => {
			bus.emitEvent({
				type: PaintEventType.SCREEN,
				screenEvent: {
					type: PaintScreenEventType.ELEMENT_POINTER_OVER,
					elementIndex,
					layerIndex,
					event: (e as any).nativeEvent,
				},
			})
		},
		[layerIndex, elementIndex, bus],
	)

	if (element.type === PaintElementType.HAND_DRAWN_PATH) {
		return (
			<SVGBrushPathElementRenderer
				elementIndex={elementIndex}
				layerIndex={layerIndex}
				onClick={onClick}
				onPointerEnter={onPointerEnter}
				element={element}
			/>
		)
	} else {
		throw new Error(
			`Unsupported element type in svg renderer ${(element as any).type}`,
		)
	}
}

export const SVGElementRenderer = InnerRenderer
