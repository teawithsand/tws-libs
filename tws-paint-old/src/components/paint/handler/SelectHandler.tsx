import { useSubscribableCallback } from "@teawithsand/tws-stl-react"
import produce from "immer"
import React, { useCallback, useRef } from "react"
import { useDispatch } from "react-redux"

import { useElementDisplayBBoxRegistry } from "@app/components/paint/render/bbox"
import { useAsRef } from "@app/components/util/useAsRef"
import {
	PaintElementCommonOptions,
	PaintSceneMutation,
	PaintToolType,
} from "@app/domain/paint/defines"
import { PaintAction, PaintActionType } from "@app/domain/paint/defines/action"
import {
	PaintEvent,
	PaintEventType,
	PaintScreenEventType,
} from "@app/domain/paint/defines/event"
import { usePaintEventBus } from "@app/domain/paint/event"
import {
	setDragSelectionBox,
	setUncommittedPaintActions,
} from "@app/domain/paint/redux"
import {
	useCurrentPaintTool,
	usePaintScene,
	usePointOperations,
} from "@app/domain/paint/redux/selector"
import { Point, rectContainsPoint, rectNormalize } from "@app/legacy/geom"

type State =
	| {
			type: "selecting"
			startPoint: Point
			lastPoint: Point
	  }
	| {
			type: "idle"
	  }

export const SelectHandler = () => {
	const bus = usePaintEventBus()
	const dispatch = useDispatch()

	const state = useRef<State>({
		type: "idle",
	})

	const pointOp = useAsRef(usePointOperations())

	const tool = useAsRef(useCurrentPaintTool())

	const manager = useAsRef(useElementDisplayBBoxRegistry())
	const scene = useAsRef(usePaintScene())

	const callback = useCallback(
		(e: PaintEvent) => {
			if (tool.current !== PaintToolType.SELECT) return
			if (e.type !== PaintEventType.SCREEN) return

			const event = e.screenEvent
			event.event.preventDefault()

			const screenPoint: Point = [
				event.event.clientX,
				event.event.clientY,
			]

			const canvasPoint =
				pointOp.current.screenPointToCanvasPoint(screenPoint)

			const makeEphemeralActions = (): PaintAction[] => {
				if (state.current.type !== "selecting") return []
				const box = rectNormalize([
					state.current.startPoint,
					state.current.lastPoint,
				])
				const results: PaintSceneMutation[] = scene.current.layers.map(
					(layer, layerIndex) => {
						const entries: [number, PaintElementCommonOptions][] =
							layer.elements.map((element, elementIndex) => {
								const tuple: [
									number,
									PaintElementCommonOptions,
								] = [
									elementIndex,
									produce(element.commonOptions, draft => {
										const elementBoundingBox =
											manager.current.getBBox(
												layerIndex,
												elementIndex,
											)

										const isIn =
											elementBoundingBox &&
											rectContainsPoint(
												box,
												elementBoundingBox[0],
											) &&
											rectContainsPoint(
												box,
												elementBoundingBox[1],
											)

										if (isIn) {
											draft.local.selection.isSelected =
												true
										} else {
											draft.local.selection.isSelected =
												false
										}
									}),
								]

								return tuple
							})
						const mutation: PaintSceneMutation = {
							type: "set-layer-elements-options",
							layerIndex: layerIndex,
							optionsMap: Object.fromEntries(entries),
						}

						return mutation
					},
				)

				return [
					{
						type: PaintActionType.SCENE_MUTATIONS,
						mutations: results,
					},
				]
			}

			if (event.type === PaintScreenEventType.POINTER_DOWN) {
				state.current = {
					type: "selecting",
					startPoint: canvasPoint,
					lastPoint: canvasPoint,
				}
			} else if (event.type === PaintScreenEventType.POINTER_UP) {
				if (state.current.type !== "selecting") return

				dispatch(setDragSelectionBox(null))
				dispatch(setUncommittedPaintActions([]))
				state.current = {
					type: "idle",
				}
			} else if (event.type === PaintScreenEventType.POINTER_MOVE) {
				if (state.current.type !== "selecting") return

				state.current.lastPoint = canvasPoint

				dispatch(
					setDragSelectionBox(
						rectNormalize([
							state.current.startPoint,
							state.current.lastPoint,
						]),
					),
				)
				dispatch(setUncommittedPaintActions(makeEphemeralActions()))
			}
		},
		[pointOp, state],
	)
	useSubscribableCallback(bus, callback)

	return <></>
}
