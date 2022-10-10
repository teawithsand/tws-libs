import { LoadingSpinner } from "@teawithsand/tws-stl-react"
import React, { useState } from "react"
import { Alert, Button, Form } from "react-bootstrap"
import { useDispatch } from "react-redux"
import styled from "styled-components"

import { throwExpression } from "@app/../../tws-stl/dist"
import { PaintScene } from "@app/domain/paint/defines"
import { loadPaintScene } from "@app/domain/paint/redux"

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

// TODO(teawithsand): make it work with suspense
//  rather than lame checks

const readFileToText = async (file: File): Promise<string> => {
	const p = new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsText(file, "UTF-8")
		reader.onload = function (evt) {
			// TODO(teawithsand): fix possible null here + cast to any
			resolve(
				(evt.target?.result ??
					throwExpression(
						new Error("This should not be null"),
					)) as any as string,
			)
		}
		reader.onerror = function (e) {
			reject(e)
		}
	})

	return await p
}

export const LoadPanel = () => {
	const [file, setFile] = useState<File | null>(null)

	const [isLoading, setIsLoading] = useState(false)
	const [lastError, setLastError] = useState<string | null>(null)

	const dispatch = useDispatch()

	if (isLoading) {
		return (
			<InnerContainer>
				<LoadingSpinner />
			</InnerContainer>
		)
	}

	return (
		<InnerContainer>
			<DescriptionRow>
				<div>
					{lastError ? (
						<Alert variant="danger">{lastError}</Alert>
					) : null}
				</div>
			</DescriptionRow>
			<TwoFormRow>
				<Form.Label>File to load from</Form.Label>
				<Form.Control
					type="file"
					accept=".twspaint"
					onChange={(e: any) => {
						if (e.target.files && e.target.files.length > 0) {
							setFile(e.target.files[0])
						} else {
							setFile(null)
						}
					}}
				/>
			</TwoFormRow>
			<ExportButton
				onClick={() => {
					setIsLoading(true)
					const load = async () => {
						if (
							!window.confirm(
								"You will lose all unsaved work. Are you sure?",
							)
						) {
							return
						}
						try {
							if (!file) {
								return
							}

							const text = await readFileToText(file)
							const res = JSON.parse(text)
							if (typeof res !== "object") {
								throw new Error("Invalid result")
							}

							dispatch(loadPaintScene(res as PaintScene))
						} catch (e) {
							setLastError(
								"Loading filed. Most likely file you've provided is corrupted.",
							)
							return
						} finally {
							setIsLoading(false)
						}

						setLastError("Imported image successfully")
					}

					load()
				}}
			>
				Load
			</ExportButton>
		</InnerContainer>
	)
}
