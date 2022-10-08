import React from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"

import { PaintActionType } from "@app/domain/paint/defines/action"
import { commitPaintActionAndResetUncommitted } from "@app/domain/paint/redux"
import { useCurrentPaintSnapshotSelector } from "@app/domain/paint/redux/selector"

import { Button } from "tws-common/ui"

const InnerContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-template-rows: auto;
	gap: 0.6rem;

	justify-items: center;
	align-items: center;
`

const ZoomInOutButton = styled(Button)`
	font-weight: bold;
`
const ResetZoomButton = styled(Button)``

const ButtonsGrid = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: 1fr;
	grid-auto-columns: 1fr;
	gap: 0.3rem;
`

export const ZoomPanel = () => {
	const zoomFactor = useCurrentPaintSnapshotSelector(
		s => s.uiState.viewOptions.zoomFactor,
	)
	const zoomPercent = Math.round(zoomFactor * 100).toFixed(0) + "%"

	const dispatch = useDispatch()

	return (
		<InnerContainer>
			<ButtonsGrid>
				<ZoomInOutButton
					onClick={() => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_ZOOM,
								zoomFactor: zoomFactor + 0.05,
							}),
						)
					}}
				>
					+
				</ZoomInOutButton>
				<ZoomInOutButton
					onClick={() => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_ZOOM,
								zoomFactor: zoomFactor - 0.05,
							}),
						)
					}}
				>
					−
				</ZoomInOutButton>
				<ResetZoomButton
					onClick={() => {
						dispatch(
							commitPaintActionAndResetUncommitted({
								type: PaintActionType.SET_ZOOM,
								zoomFactor: 1,
							}),
						)
					}}
				>
					Reset
				</ResetZoomButton>
			</ButtonsGrid>
			<div>Zoom: {zoomPercent}</div>
		</InnerContainer>
	)
}
