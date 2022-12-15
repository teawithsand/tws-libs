import React, { CSSProperties } from "react"
import styled, { css } from "styled-components"
import { GalleryEntryDisplayType, useGalleryEntryDisplayData } from "../display"

type ImageProps = {
	$type: GalleryEntryDisplayType
}

const thumbnailCss = css`
	object-fit: cover;
	max-height: 100%;
	max-width: 100%;
	width: 100%;
	height: 100%;
`

const mainCss = css`
	object-fit: contain;
	max-height: 100%;
	max-width: 100%;
	width: 100%;
	height: 100%;
`

const zoomCss = css`
	object-fit: contain;
	width: fit-content;
	height: fit-content;
`

const Img = styled.img<ImageProps>`
	${({ $type }) => {
		if ($type === GalleryEntryDisplayType.MAIN) {
			return mainCss
		} else if ($type === GalleryEntryDisplayType.THUMBNAIL) {
			return thumbnailCss
		} else if ($type === GalleryEntryDisplayType.ZOOM) {
			return zoomCss
		}
	}}
`

export const RawImageDisplay = (props: {
	src?: string
	alt?: string
	className?: string
	style?: CSSProperties
}) => {
	const info = useGalleryEntryDisplayData()

	return (
		<Img
			{...props}
			$type={info.displayType}
			style={{
				...props.style,
			}}
		/>
	)
}
