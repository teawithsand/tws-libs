import { useSubscribableCallback } from "@teawithsand/tws-stl-react"
import React, { useCallback, useRef } from "react"
import { useDispatch } from "react-redux"

import { useAsRef } from "@app/components/util/useAsRef"
import { PaintToolType } from "@app/domain/paint/defines"
import { PaintActionType } from "@app/domain/paint/defines/action"
import {
	PaintEvent,
	PaintEventType,
	PaintScreenEventType,
} from "@app/domain/paint/defines/event"
import { usePaintEventBus } from "@app/domain/paint/event"
import {
	commitPaintActionAndResetUncommitted,
	setUncommittedPaintActions,
} from "@app/domain/paint/redux"
import {
	useCurrentPaintSnapshotSelector,
	useCurrentPaintTool,
} from "@app/domain/paint/redux/selector"
import { Point } from "@app/legacy/geom"

type State =
	| {
			type: "moving"
			initialScreenPoint: Point
			lastPoint: Point
			startOffsets: {
				offsetX: number
				offsetY: number
			}
	  }
	| {
			type: "idle"
	  }

export const MoveToolHandler = () => {
	const bus = usePaintEventBus()
	const dispatch = useDispatch()

	const state = useRef<State>({
		type: "idle",
	})

	const offsets = useAsRef(
		useCurrentPaintSnapshotSelector(s => ({
			offsetX: s.uiState.viewOptions.offsetX,
			offsetY: s.uiState.viewOptions.offsetY,
		})),
	)

	const tool = useAsRef(useCurrentPaintTool())

	const callback = useCallback(
		(e: PaintEvent) => {
			if (tool.current !== PaintToolType.MOVE) return
			if (e.type !== PaintEventType.SCREEN) return

			const event = e.screenEvent

			const ensureIdleState = () => {
				state.current = {
					type: "idle",
				}
			}

			if (event.type === PaintScreenEventType.POINTER_DOWN) {
				event.event.preventDefault()
				const screenPoint: Point = [
					event.event.clientX,
					event.event.clientY,
				]

				ensureIdleState()

				state.current = {
					type: "moving",
					initialScreenPoint: screenPoint,
					lastPoint: screenPoint,
					startOffsets: { ...offsets.current },
				}
			} else if (event.type === PaintScreenEventType.POINTER_UP) {
				event.event.preventDefault()
				const screenPoint: Point = [
					event.event.clientX,
					event.event.clientY,
				]

				if (state.current.type !== "moving") return

				state.current.lastPoint = screenPoint

				dispatch(
					commitPaintActionAndResetUncommitted({
						type: PaintActionType.SET_VIEW_OFFSETS,
						offsets: {
							offsetX:
								state.current.startOffsets.offsetX +
								state.current.lastPoint[0] -
								state.current.initialScreenPoint[0],
							offsetY:
								state.current.startOffsets.offsetY +
								state.current.lastPoint[1] -
								state.current.initialScreenPoint[1],
						},
					}),
				)

				ensureIdleState()
			} else if (event.type === PaintScreenEventType.POINTER_MOVE) {
				event.event.preventDefault()
				const screenPoint: Point = [
					event.event.clientX,
					event.event.clientY,
				]

				if (state.current.type !== "moving") return

				state.current.lastPoint = screenPoint

				dispatch(
					setUncommittedPaintActions([
						{
							type: PaintActionType.SET_VIEW_OFFSETS,
							offsets: {
								offsetX:
									state.current.startOffsets.offsetX +
									state.current.lastPoint[0] -
									state.current.initialScreenPoint[0],
								offsetY:
									state.current.startOffsets.offsetY +
									state.current.lastPoint[1] -
									state.current.initialScreenPoint[1],
							},
						},
					]),
				)
			}
		},
		[offsets, state],
	)
	useSubscribableCallback(bus, callback)

	return <></>
}
