import React from "react"
import styled from "styled-components"

import { ColorPickerInput } from "@app/components/util/ColorPicker"
import { ColorPreview } from "@app/components/util/ColorPreview"
import { PaintActionType } from "@app/domain/paint/defines/action"
import {
	useCurrentPaintSnapshotSelector,
	useDispatchAndCommitPaintActions,
} from "@app/domain/paint/redux/selector"

import { Color } from "@app/legacy/color"
import { Form } from "react-bootstrap"

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
	grid-template-columns: auto auto auto;
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

export const GeneralToolSettingsPanel = () => {
	const strokeColor = useCurrentPaintSnapshotSelector(
		s => s.uiState.globalToolConfig.strokeColor,
	)
	const fillColor: Color = useCurrentPaintSnapshotSelector(
		s => s.uiState.globalToolConfig.fillColor ?? ([0, 0, 0, 0] as Color),
	)

	const dispatch = useDispatchAndCommitPaintActions()

	return (
		<InnerContainer>
			<FormRow>
				<Form.Label>Stroke color</Form.Label>
				<ColorPreview color={strokeColor} />
				<ColorPickerInput
					value={strokeColor}
					onChange={c =>
						dispatch({
							type: PaintActionType.SET_STROKE_COLOR,
							color: c,
						})
					}
				/>
			</FormRow>
			<FormRow>
				<Form.Label>Fill color</Form.Label>
				<ColorPreview color={fillColor} />
				<ColorPickerInput
					value={fillColor}
					onChange={c =>
						dispatch({
							type: PaintActionType.SET_FILL_COLOR,
							color: c,
						})
					}
				/>
			</FormRow>
		</InnerContainer>
	)
}
