import React from "react"
import styled from "styled-components"

import { PaintPanelType } from "@app/components/paint/panels/panels"

import { Button } from "tws-common/ui"

const InnerContainer = styled.div`
	display: flex;
	gap: 1rem;
	flex-flow: row wrap;

	& > * {
		flex: 1;
		flex-basis: calc(50% - 0.6rem); // 50% - padding
	}
`

const PanelButton = styled(Button)`
	font-size: 1.1rem;
`

const PanelSection = styled.div`
	display: flex;
	gap: 0.5rem;
	flex-flow: column nowrap;

	background-color: rgba(255, 255, 255, 0.9);
	padding: 0.3rem;
	border-radius: 0.25rem;
`

const PanelSectionTitle = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	text-align: center;
`

export const PanelPicker = (props: {
	currentPanelType: PaintPanelType | null
	onPanelChange?: (ty: PaintPanelType) => void
}) => {
	const { currentPanelType, onPanelChange = () => void 0 } = props

	const makeCallback = (ty: PaintPanelType) => {
		return () => {
			onPanelChange(ty)
		}
	}

	return (
		<InnerContainer>
			<PanelSection>
				<PanelSectionTitle>Screen/Display</PanelSectionTitle>
				<PanelButton onClick={makeCallback(PaintPanelType.ZOOM)}>
					Zoom
				</PanelButton>
				<PanelButton onClick={makeCallback(PaintPanelType.SCENE_SIZE)}>
					Scene size
				</PanelButton>
			</PanelSection>
			<PanelSection>
				<PanelSectionTitle>Tool</PanelSectionTitle>
				<PanelButton onClick={makeCallback(PaintPanelType.PICK_TOOL)}>
					Pick tool
				</PanelButton>
				<PanelButton
					onClick={makeCallback(PaintPanelType.GENERAL_TOOL_SETTINGS)}
				>
					General tool settings
				</PanelButton>
			</PanelSection>
			<PanelSection>
				<PanelSectionTitle>Save/Load/Export</PanelSectionTitle>
				<PanelButton onClick={makeCallback(PaintPanelType.EXPORT)}>
					Export
				</PanelButton>
				<PanelButton onClick={makeCallback(PaintPanelType.SAVE)}>
					Save
				</PanelButton>
				<PanelButton onClick={makeCallback(PaintPanelType.LOAD)}>
					Load
				</PanelButton>
			</PanelSection>
		</InnerContainer>
	)
}
