import React, { CSSProperties, ReactNode } from "react"
import styled, { css } from "styled-components"
import { GalleryEntryDisplayType, useGalleryEntryDisplayData } from "../display"

type ImageProps = {
	$type: GalleryEntryDisplayType
}

const allCss = css`
	.gatsby-image-wrapper {
		& > div:first-child {
			visibility: hidden;
		}
	}
`

const thumbnailCss = css`
	max-height: 100%;
	max-width: 100%;
	width: 100%;
	height: 100%;

	& > * {
		max-height: 100%;
		max-width: 100%;
		width: 100%;
		height: 100%;

		img {
			object-fit: cover !important;
		}
	}
`

const mainCss = css`
	display: contents; // now that's a hack, but hey, it works

	& > * {
		max-width: 100%;
		max-height: 100%;

		img {
			object-fit: contain !important;
		}
	}
`

const zoomCss = css`
	width: fit-content;
	height: fit-content;
	max-width: none;
	max-height: none;

	& > * {
		max-width: none;
		max-height: none;
		width: fit-content;
		height: fit-content;
	}
`

const Container = styled.div<ImageProps>`
	${allCss}

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

export const GatsbyImageWrapper = (props: {
	children?: ReactNode
	style?: CSSProperties
	className?: string
}) => {
	const info = useGalleryEntryDisplayData()

	return (
		<Container
			$type={info.displayType}
			className={props.className}
			style={props.style}
		>
			{props.children}
		</Container>
	)
}
