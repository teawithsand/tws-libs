import React from "react"
import styled from "styled-components"
import { Button } from "tws-common/ui"

const InnerGalleryTopBar = styled.div.attrs(
	({ $visible }: { $visible: boolean }) => ({
		style: {
			...(!$visible ? { display: "none" } : {}),
		},
	}),
)`
	grid-row: 1;
	grid-column: 1;

	display: grid;
	grid-template-columns: minmax(0, fit-content) minmax(0, fit-content);
	grid-template-rows: 1fr;

	padding-top: 0.4rem;
	padding-bottom: 0.4rem;
`

const TopBarEntryCounterElement = styled.div`
	grid-row: 1;
	grid-column: 1;
	font-size: 1.2rem;
	font-weight: bolder;
	text-align: left;
`

const TopBarEntryRightTopButtonsElement = styled.div`
	grid-row: 1;
	grid-column: 2;
	text-align: right;
`

const GalleryTopBar = (props: {
	visible?: boolean
	currentEntryIndex: number
	entryCount: number
	onToggleFullscreen: () => void
}) => {
	const {
		visible,
		currentEntryIndex: currentElementIndex,
		entryCount: elementCount,
		onToggleFullscreen,
	} = props
	return (
		<InnerGalleryTopBar
			{...({
				$visible: visible ?? true,
			} as any)}
		>
			<TopBarEntryCounterElement>
				{currentElementIndex + 1}/{elementCount}
			</TopBarEntryCounterElement>
			<TopBarEntryRightTopButtonsElement>
				<Button variant="outline-light" onClick={onToggleFullscreen}>
					Toggle fullscreen
				</Button>
			</TopBarEntryRightTopButtonsElement>
		</InnerGalleryTopBar>
	)
}

export default GalleryTopBar
