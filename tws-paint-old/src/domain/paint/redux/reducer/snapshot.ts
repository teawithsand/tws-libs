import { current, isDraft } from "@reduxjs/toolkit";
import produce, { setAutoFreeze } from "immer";



import { applyMutationOnDraft } from "@app/domain/paint/defines";
import { PaintAction, PaintActionType } from "@app/domain/paint/defines/action";
import { PaintStateSnapshot } from "@app/domain/paint/redux/state";


setAutoFreeze(false) // improves performance of immer AFAIK
export const copyAndOperateOnStateSnapshot = (
	snapshot: PaintStateSnapshot,
	operate: (snapshot: PaintStateSnapshot) => void,
): PaintStateSnapshot => {
	if (isDraft(snapshot)) {
		snapshot = current(snapshot)
	}

	return produce(snapshot, draft => operate(draft))
}

const roundZoom = (a: number) => Math.round(a * 1000) / 1000

export const applyActionOnPaintStateSnapshot = (
	snapshot: PaintStateSnapshot,
	action: PaintAction,
) => {
	if (action.type === PaintActionType.SCENE_MUTATIONS) {
		action.mutations.forEach(m =>
			applyMutationOnDraft(snapshot.sceneState.scene, m),
		)
	} else if (action.type === PaintActionType.SET_FILL_COLOR) {
		snapshot.uiState.globalToolConfig.fillColor = action.color
	} else if (action.type === PaintActionType.SET_STROKE_COLOR) {
		snapshot.uiState.globalToolConfig.strokeColor = action.color
	} else if (action.type === PaintActionType.SET_ZOOM) {
		snapshot.uiState.viewOptions.zoomFactor = roundZoom(action.zoomFactor)
	} else if (action.type === PaintActionType.SET_SCENE_DIMENSIONS) {
		snapshot.sceneState.scene.options.sceneHeight = action.dimensions.height
		snapshot.sceneState.scene.options.sceneWidth = action.dimensions.width
	} else if (action.type === PaintActionType.SET_SCENE_OFFSETS) {
		snapshot.sceneState.scene.options.offsetX = action.offsets.offsetX
		snapshot.sceneState.scene.options.offsetY = action.offsets.offsetY
	} else if (action.type === PaintActionType.SET_VIEW_OFFSETS) {
		snapshot.uiState.viewOptions.offsetX = action.offsets.offsetX
		snapshot.uiState.viewOptions.offsetY = action.offsets.offsetY
	} else if (action.type === PaintActionType.SET_ACTIVE_TOOL) {
		snapshot.uiState.globalToolConfig.activeTool = action.tool
	} else {
		throw new Error(`Unknown action type: ${(action as any).type}`)
	}
}