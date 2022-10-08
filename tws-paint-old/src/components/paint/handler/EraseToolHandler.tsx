import produce from "immer"
import React, { useCallback, useRef } from "react"
import { useDispatch } from "react-redux"

import { useAsRef } from "@app/components/util/useAsRef"
import {
	PaintElementCommonOptions,
	PaintSceneMutation,
	PaintToolType,
} from "@app/domain/paint/defines"
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

import { useSubscribableCallback } from "tws-common/event-bus"
import { compareNumbers, inverseComparator } from "tws-common/lang/sort"
import { throwExpression } from "tws-common/lang/throw"

// Map of layer index to set of touched element index
type TouchedElements = Map<number, Set<number>>

type State =
	| {
			type: "erasing"
			touchedElements: TouchedElements
	  }
	| {
			type: "idle"
	  }

export const EraseToolHandler = () => {
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

	// HACK(teawithsand): create special action type to get rid of this ugly hack
	// tools shouldn't require scene
	// the flow should be unidirectional - from tool to scene.
	const scene = useAsRef(
		useCurrentPaintSnapshotSelector(s => s.sceneState.scene),
	)
	const tool = useAsRef(useCurrentPaintTool())

	const callback = useCallback(
		(e: PaintEvent) => {
			if (tool.current !== PaintToolType.ERASE) return
			if (e.type !== PaintEventType.SCREEN) return

			const event = e.screenEvent

			const ensureIdleState = () => {
				state.current = {
					type: "idle",
				}
			}

			const initEraseState = () => {
				state.current = {
					type: "erasing",
					touchedElements: new Map(),
				}
			}

			const makeMutations = (final: boolean): PaintSceneMutation[] => {
				if (state.current.type !== "erasing") return []

				if (final) {
					const mutations: PaintSceneMutation[] = []
					for (const [
						layerIndex,
						elements,
					] of state.current.touchedElements.entries()) {
						// when deleting elements from the end
						// indexes of previous elements aren't changed
						// so "old" AKA pre-deletion indexes are valid after deletion of some element
						// so it does what we want
						const sorted = [...elements].sort(
							inverseComparator(compareNumbers),
						)

						for (const elementIndex of sorted) {
							mutations.push({
								type: "drop-layer-elements",
								layerIndex: layerIndex,
								fromElementIndex: elementIndex,
								toElementIndex: elementIndex + 1,
							})
						}
					}
					return mutations
				} else {
					// when mutation's not final
					// just hide element
					const mutations: PaintSceneMutation[] = []
					for (const [
						layerIndex,
						elements,
					] of state.current.touchedElements.entries()) {
						const res: [number, PaintElementCommonOptions][] = [
							...elements.values(),
						].map(v => {
							const currentOptions =
								scene.current.layers[layerIndex].elements[v]
									.commonOptions
							const imm: [number, PaintElementCommonOptions] = [
								v,
								produce(currentOptions, draft => {
									draft.local.removal.isMarkedForRemoval =
										true
								}),
							]

							return imm
						})

						mutations.push({
							type: "set-layer-elements-options",
							layerIndex,
							optionsMap: Object.fromEntries(res),
						})
					}
					return mutations
				}
			}

			if (event.type === PaintScreenEventType.POINTER_DOWN) {
				event.event.preventDefault()
				initEraseState()
			} else if (event.type === PaintScreenEventType.POINTER_UP) {
				event.event.preventDefault()

				if (state.current.type !== "erasing") return

				dispatch(
					commitPaintActionAndResetUncommitted({
						type: PaintActionType.SCENE_MUTATIONS,
						mutations: makeMutations(true),
					}),
				)

				ensureIdleState()
			} else if (
				event.type === PaintScreenEventType.ELEMENT_POINTER_OVER
			) {
				if (state.current.type !== "erasing") return

				if (!state.current.touchedElements.get(event.layerIndex)) {
					state.current.touchedElements.set(
						event.layerIndex,
						new Set(),
					)
				}
				const set =
					state.current.touchedElements.get(event.layerIndex) ??
					throwExpression(new Error("unreachable code"))

				const prevLength = set.size
				set.add(event.elementIndex)
				const newLength = set.size

				if (prevLength !== newLength) {
					dispatch(
						setUncommittedPaintActions([
							{
								type: PaintActionType.SCENE_MUTATIONS,
								mutations: makeMutations(false),
							},
						]),
					)
				}
			}
		},
		[dispatch, offsets, state],
	)
	useSubscribableCallback(bus, callback)

	return <></>
}
