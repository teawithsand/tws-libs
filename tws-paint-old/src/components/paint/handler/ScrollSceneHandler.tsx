import React, { useEffect } from "react"

import { useAsRef } from "@app/components/util/useAsRef"
import { PaintActionType } from "@app/domain/paint/defines/action"
import {
	useCurrentPaintSnapshotSelector,
	useDispatchAndCommitPaintActions,
} from "@app/domain/paint/redux/selector"

const scrollSpeed = 50

export const ScrollSceneHandler = (props: { sceneElement: HTMLElement }) => {
	const { sceneElement } = props

	const offsets = useAsRef(
		useCurrentPaintSnapshotSelector(s => ({
			offsetX: s.uiState.viewOptions.offsetX,
			offsetY: s.uiState.viewOptions.offsetY,
		})),
	)

	const dispatchPaintAction = useDispatchAndCommitPaintActions()

	useEffect(() => {
		const wheelHandler = (e: WheelEvent) => {
			if (!e.ctrlKey) {
				e.preventDefault()

				if (e.shiftKey) {
					dispatchPaintAction({
						type: PaintActionType.SET_VIEW_OFFSETS,
						offsets: {
							...offsets.current,
							offsetX:
								offsets.current.offsetX +
								(e.deltaY > 0 ? scrollSpeed : -scrollSpeed),
						},
					})
				} else {
					dispatchPaintAction({
						type: PaintActionType.SET_VIEW_OFFSETS,
						offsets: {
							...offsets.current,
							offsetY:
								offsets.current.offsetY +
								(e.deltaY > 0 ? scrollSpeed : -scrollSpeed),
						},
					})
				}
			}
		}

		sceneElement.addEventListener("wheel", wheelHandler, {
			passive: false,
		})

		return () => {
			sceneElement.removeEventListener("wheel", wheelHandler)
		}
	}, [sceneElement, offsets, dispatchPaintAction])

	return <></>
}
