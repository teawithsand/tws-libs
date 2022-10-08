import { CSSProperties } from "react"

import { PaintToolType } from "@app/domain/paint/defines"
import {
	useCurrentPaintSnapshotSelector,
	useCurrentPaintTool,
	usePaintScene,
} from "@app/domain/paint/redux/selector/misc"

import { Point } from "tws-common/geometry/point"

export const usePresentationDimensions = () => {
	const scene = usePaintScene()
	const viewOptions = useCurrentPaintSnapshotSelector(
		s => s.uiState.viewOptions,
	)

	return {
		width: scene.options.sceneWidth * viewOptions.zoomFactor,
		height: scene.options.sceneHeight * viewOptions.zoomFactor,
		translateX: viewOptions.offsetX,
		translateY: viewOptions.offsetY,
	}
}

export const usePointOperations = () => {
	const viewOptions = useCurrentPaintSnapshotSelector(
		s => s.uiState.viewOptions,
	)

	// TODO(teawithsand): factor in scene(AKA viewport) offsets
	return {
		screenPointToCanvasPoint: (point: Point): Point => {
			return [
				(point[0] - viewOptions.offsetX) / viewOptions.zoomFactor,
				(point[1] - viewOptions.offsetY) / viewOptions.zoomFactor,
			]
		},
		canvasPointToScreenPoint: (point: Point): Point => {
			return [
				point[0] * viewOptions.zoomFactor + viewOptions.offsetX,
				point[1] * viewOptions.zoomFactor + viewOptions.offsetY,
			]
		},
	}
}

export const usePaintCursor = (): CSSProperties["cursor"] => {
	const tool = useCurrentPaintTool()

	if (tool === PaintToolType.PATH) {
		return "crosshair"
	} else if (tool === PaintToolType.MOVE) {
		return "grab"
	} else if (tool === PaintToolType.ERASE) {
		return "default"
	} else {
		return "default"
	}
}
