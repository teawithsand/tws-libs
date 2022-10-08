import React from "react"
import styled from "styled-components"

import { PaintToolType } from "@app/domain/paint/defines"
import { PaintActionType } from "@app/domain/paint/defines/action"
import {
	useCurrentPaintSnapshotSelector,
	useDispatchAndCommitPaintActions,
} from "@app/domain/paint/redux/selector"

import { Button } from "tws-common/ui"

const InnerContainer = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: 0.6rem;

	justify-items: center;
	align-items: center;

	& > * {
		flex-grow: 1;
		flex-basis: 33%;
	}
`

export const PickToolPanel = () => {
	const tool = useCurrentPaintSnapshotSelector(
		s => s.uiState.globalToolConfig.activeTool,
	)
	const dispatch = useDispatchAndCommitPaintActions()

	return (
		<InnerContainer>
			<Button
				onClick={() => {
					dispatch({
						type: PaintActionType.SET_ACTIVE_TOOL,
						tool: PaintToolType.PATH,
					})
				}}
			>
				Brush
			</Button>
			<Button
				onClick={() => {
					dispatch({
						type: PaintActionType.SET_ACTIVE_TOOL,
						tool: PaintToolType.MOVE,
					})
				}}
			>
				Move canvas
			</Button>
			<Button
				onClick={() => {
					dispatch({
						type: PaintActionType.SET_ACTIVE_TOOL,
						tool: PaintToolType.ERASE,
					})
				}}
			>
				Eraser
			</Button>
			<Button
				onClick={() => {
					dispatch({
						type: PaintActionType.SET_ACTIVE_TOOL,
						tool: PaintToolType.SELECT,
					})
				}}
			>
				Select
			</Button>
		</InnerContainer>
	)
}
