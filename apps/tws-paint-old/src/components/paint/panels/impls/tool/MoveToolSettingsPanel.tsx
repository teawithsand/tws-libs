import React from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"

import { PaintActionType } from "@app/domain/paint/defines/action"
import { commitPaintActionAndResetUncommitted } from "@app/domain/paint/redux"
import { useCurrentPaintSnapshotSelector } from "@app/domain/paint/redux/selector"

import { Button, Form } from "react-bootstrap"

const InnerContainer = styled.div`
	display: grid;
	grid-auto-flow: row;
	grid-template-rows: auto;
	gap: 0.6rem;

	justify-items: center;
	align-items: center;
`

const FormRowDouble = styled(Form.Group)`
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

const RowSingle = styled.div`
	& > * {
		width: 100%;
	}
`

export const MoveToolSettingsPanel = () => {
	const offsets = useCurrentPaintSnapshotSelector(s => ({
		offsetX: s.uiState.viewOptions.offsetX,
		offsetY: s.uiState.viewOptions.offsetY,
	}))

	const dispatch = useDispatch()

	return (
		<InnerContainer>
			<FormRowDouble>
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
			</FormRowDouble>
			<FormRowDouble>
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
			</FormRowDouble>
			<RowSingle>
				<Button
					onClick={() => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_VIEW_OFFSETS,
								offsets: {
									offsetX: 0,
									offsetY: 0,
								},
							}),
						)
					}}
				>
					Reset
				</Button>
			</RowSingle>
		</InnerContainer>
	)
}
