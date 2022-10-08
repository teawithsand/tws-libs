import React from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"

import { PaintActionType } from "@app/domain/paint/defines/action"
import { commitPaintActionAndResetUncommitted } from "@app/domain/paint/redux"
import { useCurrentPaintSnapshotSelector } from "@app/domain/paint/redux/selector"

import { Form } from "tws-common/ui"

const InnerContainer = styled.div`
	display: grid;
	grid-auto-flow: row;
	grid-template-rows: auto;
	gap: 0.6rem;

	justify-items: center;
	align-items: center;
`

const FormRow = styled(Form.Group)`
	display: grid;
	grid-template-columns: auto auto;
	grid-auto-flow: row;
	gap: 0.6rem;

	align-items: center;
	justify-items: center;

	& > label {
		width: fit-content;
		padding: 0;
		margin: 0;
	}
`

export const SceneSizePanel = () => {
	const offsets = useCurrentPaintSnapshotSelector(s => ({
		offsetX: s.uiState.viewOptions.offsetX,
		offsetY: s.uiState.viewOptions.offsetY,
	}))
	const scene = useCurrentPaintSnapshotSelector(s => ({
		width: s.sceneState.scene.options.sceneWidth,
		height: s.sceneState.scene.options.sceneHeight,
	}))

	const dispatch = useDispatch()

	return (
		<InnerContainer>
			<FormRow>
				<Form.Label>Offset X</Form.Label>
				<Form.Control
					type="number"
					value={offsets.offsetX}
					onChange={(e: any) => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_VIEW_OFFSETS,
								offsets: {
									...offsets,
									offsetX: parseInt(e.target.value),
								},
							}),
						)
					}}
				/>
			</FormRow>
			<FormRow>
				<Form.Label>Offset Y</Form.Label>
				<Form.Control
					type="number"
					value={offsets.offsetY}
					onChange={(e: any) => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_VIEW_OFFSETS,
								offsets: {
									...offsets,
									offsetY: parseInt(e.target.value),
								},
							}),
						)
					}}
				/>
			</FormRow>
			<FormRow>
				<Form.Label>Canvas width</Form.Label>
				<Form.Control
					type="number"
					value={scene.width}
					onChange={(e: any) => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_SCENE_DIMENSIONS,
								dimensions: {
									...scene,
									width: parseInt(e.target.value),
								},
							}),
						)
					}}
				/>
			</FormRow>
			<FormRow>
				<Form.Label>Canvas height</Form.Label>
				<Form.Control
					type="number"
					value={scene.height}
					onChange={(e: any) => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_SCENE_DIMENSIONS,
								dimensions: {
									...scene,
									height: parseInt(e.target.value),
								},
							}),
						)
					}}
				/>
			</FormRow>
		</InnerContainer>
	)
}
