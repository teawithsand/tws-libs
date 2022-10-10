import { createReducer } from "@reduxjs/toolkit"

import {
	commitPaintActionAndResetUncommitted,
	loadPaintScene,
	redoPaintActions,
	resetPaintActionsStack,
	setDragSelectionBox,
	setSceneSavedAction,
	setUncommittedPaintActions,
	undoPaintActions,
} from "@app/domain/paint/redux/actions"
import {
	commitActionToActionStackOnPaintState,
	pushUndoStackOntoRootSnapshot,
	recomputeSnapshotsOnActionStackChange as recomputeSnapshotsOnActionStackChangeOrUncommittedActionsChange,
	setUncommittedActionsOnPaintState,
} from "@app/domain/paint/redux/reducer/state"
import {
	initialPaintStateSnapshot,
	PaintState,
} from "@app/domain/paint/redux/state"

export const paintStateReducer = createReducer<PaintState>(
	{
		actionsState: {
			wasSceneMutatedSinceLastSave: false,
			currentSelectionDragBox: null,
			actionsStackMaxSize: 200,
			actionsStack: [],
			redoStack: [],
			uncommittedActions: [],
		},
		currentSnapshot: initialPaintStateSnapshot,
		preActionsSnapshot: initialPaintStateSnapshot,
		preUncommittedSnapshot: initialPaintStateSnapshot,
	},
	// niy for now
	builder =>
		builder
			.addCase(setUncommittedPaintActions, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave = true
				setUncommittedActionsOnPaintState(state, action.payload)
			})
			.addCase(commitPaintActionAndResetUncommitted, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave = true

				// this is ok as recomputation will be triggered far enough on lower level of snapshots
				state.actionsState.uncommittedActions = []

				commitActionToActionStackOnPaintState(state, action.payload)
				recomputeSnapshotsOnActionStackChangeOrUncommittedActionsChange(
					state,
				)
			})
			.addCase(resetPaintActionsStack, state => {
				state.actionsState.wasSceneMutatedSinceLastSave = true

				pushUndoStackOntoRootSnapshot(state)
			})
			.addCase(undoPaintActions, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave = true

				for (let i = 0; i < action.payload; i++) {
					const action = state.actionsState.actionsStack.pop()
					if (action) state.actionsState.redoStack.push(action)
					else break
				}

				recomputeSnapshotsOnActionStackChangeOrUncommittedActionsChange(
					state,
				)
			})
			.addCase(redoPaintActions, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave = true

				for (let i = 0; i < action.payload; i++) {
					const action = state.actionsState.redoStack.pop()
					if (action) state.actionsState.actionsStack.push(action)
					else break
				}

				recomputeSnapshotsOnActionStackChangeOrUncommittedActionsChange(
					state,
				)
			})
			.addCase(loadPaintScene, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave = false

				pushUndoStackOntoRootSnapshot(state)
				state.preActionsSnapshot.sceneState.scene = action.payload
				recomputeSnapshotsOnActionStackChangeOrUncommittedActionsChange(
					state,
				)
			})
			.addCase(setSceneSavedAction, (state, action) => {
				state.actionsState.wasSceneMutatedSinceLastSave =
					!action.payload
			})
			.addCase(setDragSelectionBox, (state, action) => {
				state.actionsState.currentSelectionDragBox = action.payload
			}),
)
