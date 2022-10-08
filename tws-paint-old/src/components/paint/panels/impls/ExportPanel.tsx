import React, { useState } from "react"
import styled from "styled-components"

import { SVGSceneRenderer } from "@app/components/paint/render/svg/SVGSceneRenderer"
import { useCurrentPaintSnapshotSelector } from "@app/domain/paint/redux/selector"

import { Button, Form } from "tws-common/ui"
import { downloadString, downloadUrl } from "tws-common/webapi/download"

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

const FourFormRow = styled(TwoFormRow)`
	grid-template-columns: auto auto auto auto;
`

const DescriptionRow = styled.div`
	width: 100%;
	text-align: center;
`

const ExportButton = styled(Button)`
	width: 100%;
`

const validExtensions = ["jpg", "jpeg", "gif", "png", "svg"]

const formatForExtension = (ext: string) => {
	if (ext === "jpg") {
		ext = "jpeg"
	}
	return `image/${ext}`
}

const SceneContainer = styled.div`
	display: none;
	pointer-events: none;
	visibility: hidden;
	opacity: 0;
`

export const ExportPanel = () => {
	const [fileName, setFileName] = useState("tws-paint-image.svg")

	const split = fileName.split(".")
	const ext = split[split.length - 1].toLowerCase()

	const isFileNameValid = !(() => {
		if (split.length <= 1) return true
		if (validExtensions.some(e => e === ext)) {
			return false
		}
		return true
	})()

	const scene = useCurrentPaintSnapshotSelector(s => s.sceneState.scene)
	const [exportWidth, setExportWidth] = useState(
		() => scene.options.sceneWidth,
	)
	const [exportHeight, setExportHeight] = useState(
		() => scene.options.sceneHeight,
	)

	const [innerRender, setInnerRender] = useState<SVGSVGElement | null>(null)

	const exportImageToCanvas = async (text: string, format: string) => {
		const image = new Image()
		const src = `data:image/svg+xml;charset=utf8,${text}`
		image.style.display = "none"

		const p = new Promise((resolve, reject) => {
			image.onload = resolve
			image.onerror = reject
		})

		image.src = src

		await p

		const canvas = document.createElement("canvas")
		try {
			canvas.style.display = "none"

			canvas.width = exportWidth
			canvas.height = exportHeight

			const ctx = canvas.getContext("2d")
			if (ctx) {
				ctx.drawImage(image, 0, 0)
			} else {
				throw new Error("got no 2d context")
			}

			return canvas.toDataURL(format)
		} finally {
			// document.removeChild(canvas)
		}
	}

	return (
		<InnerContainer>
			<DescriptionRow>
				<p>
					Allowed extensions are: <b>.svg</b>, <b>png</b>, <b>gif</b>,{" "}
					<b>jpg/jpeg</b>. If extension is not valid, <b>svg</b>{" "}
					format is used.
				</p>

				<p>Whole canvas(AKA drawing space) will be exported.</p>
				<p>
					You can also change export width/height if you want your
					image to be smaller/bigger without quality loss due to
					scaling up. Keeping aspect ratio correct is on you though.
				</p>
			</DescriptionRow>
			<TwoFormRow>
				<Form.Label>File name</Form.Label>
				<Form.Control
					type="text"
					value={fileName}
					isInvalid={!isFileNameValid}
					onChange={(e: any) => {
						setFileName(e.target.value)
					}}
				/>
			</TwoFormRow>
			<FourFormRow>
				<Form.Label>Export width</Form.Label>
				<Form.Control
					type="number"
					min="1"
					step="1"
					value={exportWidth}
					onChange={(e: any) => {
						setExportWidth(parseInt(e.target.value))
					}}
				/>
				<Button
					onClick={() => {
						setExportWidth(
							Math.round(
								(scene.options.sceneWidth /
									scene.options.sceneHeight) *
									exportHeight,
							),
						)
					}}
				>
					Adj. to AR
				</Button>
				<Button
					onClick={() => {
						setExportWidth(scene.options.sceneWidth)
					}}
				>
					Reset
				</Button>
			</FourFormRow>
			<FourFormRow>
				<Form.Label>Export height</Form.Label>
				<Form.Control
					type="number"
					min="1"
					step="1"
					value={exportHeight}
					onChange={(e: any) => {
						setExportHeight(parseInt(e.target.value))
					}}
				/>
				<Button
					onClick={() => {
						setExportHeight(
							Math.round(
								(scene.options.sceneHeight /
									scene.options.sceneWidth) *
									exportWidth,
							),
						)
					}}
				>
					Adj. to AR
				</Button>
				<Button
					onClick={() => {
						setExportHeight(scene.options.sceneHeight)
					}}
				>
					Reset
				</Button>
			</FourFormRow>
			<ExportButton
				onClick={() => {
					;(async () => {
						if (innerRender) {
							const text = innerRender.outerHTML
							if (isFileNameValid && ext !== "svg") {
								const format = formatForExtension(ext)
								const url = await exportImageToCanvas(
									text,
									format,
								)

								downloadUrl(url, fileName)
							} else {
								downloadString(text, "image/svg+xml", fileName)
							}
						}
					})()
				}}
			>
				Export
			</ExportButton>
			<SceneContainer>
				<SVGSceneRenderer
					presentationHeight={exportHeight}
					presentationWidth={exportWidth}
					scene={scene}
					ref={setInnerRender}
				/>
			</SceneContainer>
		</InnerContainer>
	)
}
