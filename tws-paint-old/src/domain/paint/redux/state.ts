import {
	PaintGlobalToolConfig,
	PaintScene,
	PaintToolsConfig,
	PaintToolType,
	PaintViewOptions,
} from "@app/domain/paint/defines"
import { PaintAction } from "@app/domain/paint/defines/action"

import { Rect } from "tws-common/geometry"

export type PaintSceneState = {
	// in future some things
	// about that scene
	// like click element targeting may be implemented
	// so this parent object is left as-is

	scene: PaintScene
}

/**
 * This is separate from PaintUIState, as in future PaintUIState may require snapshots in order to handle large amount of actions.
 * If we want to use big stacks of course.
 *
 * Mutations are handled separately, so it's not a problem.
 */
export type PaintActionsState = {
	// TODO(teawithsand): make this variable change along with ctrl+z ing stuff
	wasSceneMutatedSinceLastSave: boolean
	currentSelectionDragBox: Rect | null

	uncommittedActions: PaintAction[]

	actionsStackMaxSize: number

	actionsStack: PaintAction[]
	redoStack: PaintAction[]
}

export type PaintUIState = {
	// NIY; tools and stuff here

	viewOptions: PaintViewOptions

	globalToolConfig: PaintGlobalToolConfig
	toolsConfig: PaintToolsConfig
}

export type PaintStateSnapshot = {
	uiState: PaintUIState
	sceneState: PaintSceneState
}

export type PaintState = {
	actionsState: PaintActionsState

	preActionsSnapshot: PaintStateSnapshot
	preUncommittedSnapshot: PaintStateSnapshot
	currentSnapshot: PaintStateSnapshot
}

export const initialPaintStateSnapshot: PaintStateSnapshot = {
	sceneState: {
		scene: {
			layers: [],
			options: {
				offsetX: 0,
				offsetY: 0,
				sceneHeight: 300,
				sceneWidth: 300,
				backgroundColor: [255, 255, 255, 1],
			},
		},
	},
	uiState: {
		globalToolConfig: {
			activeLayerIndex: 0,
			activeTool: PaintToolType.PATH,
			strokeColor: [0, 0, 0, 1],
			fillColor: null,
		},
		toolsConfig: {
			[PaintToolType.MOVE]: {},
			[PaintToolType.PATH]: {
				join: "round",
				stroke: "round",
			},
			[PaintToolType.ERASE]: {},
			[PaintToolType.SELECT]: {},
		},
		viewOptions: {
			offsetX: 0,
			offsetY: 0,
			zoomFactor: 1,
		},
	},
}
