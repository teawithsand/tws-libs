import React, { useState } from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"

import { setSceneSavedAction } from "@app/domain/paint/redux"
import { useCurrentPaintSnapshotSelector } from "@app/domain/paint/redux/selector"

import { Button, Form } from "tws-common/ui"
import { downloadString } from "tws-common/webapi/download"

const InnerContainer = styled.div`
	display: grid;
	grid-auto-flow: row;
	grid-template-rows: auto;
	gap: 0.6rem;

	justify-items: center;
	align-items: center;
`

const TwoFormRow = styled(Form.Group)`
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

const DescriptionRow = styled.div`
	width: 100%;
	text-align: center;
`

const ExportButton = styled(Button)`
	width: 100%;
`

export const SavePanel = () => {
	const [fileName, setFileName] = useState("tws-paint-image")

	const scene = useCurrentPaintSnapshotSelector(s => s.sceneState.scene)
	const dispatch = useDispatch()

	return (
		<InnerContainer>
			<DescriptionRow>
				<p>
					This saves painting to .twspaint files, which are understood
					by this program.
				</p>
			</DescriptionRow>
			<TwoFormRow>
				<Form.Label>File name(without extension)</Form.Label>
				<Form.Control
					type="text"
					value={fileName}
					onChange={(e: any) => {
						setFileName(e.target.value)
					}}
				/>
			</TwoFormRow>
			<ExportButton
				onClick={() => {
					downloadString(
						JSON.stringify(scene),
						"application/json",
						fileName + ".twspaint",
					)

					dispatch(setSceneSavedAction(true))
				}}
			>
				Save
			</ExportButton>
		</InnerContainer>
	)
}
