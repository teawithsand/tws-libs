import React, { CSSProperties } from "react"
import styled from "styled-components"
import { useGalleryControls } from "../context"
import { DefaultGalleryDisplay } from "../display"

const Container = styled.div`
	overflow: hidden;

	display: grid;
	> * {
		grid-row: 1;
		grid-column: 1;
	}

	user-select: none;
`

const Arrow = styled.div`
	// Center arrow
	display: grid;
	align-items: center;
	justify-items: center;
	text-align: center;

	// TODO(teawithsand): use svg or sth as it's easier to get appropriate size for these
	// and there is still problems with different fonts when using that solution.
	font-size: 2em;

	// For safety
	overflow: hidden;

	width: 10%;
	@media (max-width: 1000px) {
		width: 33%;
	}

	// On small devices(like phones): there is no arrows. Only swiping.
	@media (max-width: 500px) {
		display: none;
	}

	background-color: rgba(255, 255, 255, 0.1);
	z-index: 2;

	& > svg {
		height: 100%;
		width: 100%;

		& {
			fill: white;
		}
	}

	opacity: 0;
	transition: opacity 300ms;

	&:hover {
		opacity: 1;
	}
`

const ArrowLeft = styled(Arrow)`
	margin-right: auto;
	height: 100%;
`

const ArrowRight = styled(Arrow)`
	margin-left: auto;
	height: 100%;
`

const ArrowSVG = (props: {
	style?: React.CSSProperties
	className?: string
}) => {
	return (
		<svg
			version="1.1"
			x="0px"
			y="0px"
			width="558.957px"
			height="558.957px"
			viewBox="0 0 558.957 558.957"
			{...props}
		>
			<g>
				<g>
					<polygon points="462.745,0 96.212,279.479 462.745,558.957 462.745,419.221 278.713,279.479 462.745,139.738 		" />
				</g>
			</g>
		</svg>
	)
}

export const GalleryMiddleBar = (props: {
	style?: CSSProperties
	className?: string
}) => {
	const controls = useGalleryControls()
	return (
		<Container {...props}>
			<ArrowLeft
				onClick={() => {
					controls.prev()
				}}
			>
				<ArrowSVG />
			</ArrowLeft>
			<DefaultGalleryDisplay />
			<ArrowRight
				onClick={() => {
					controls.next()
				}}
			>
				<ArrowSVG
					style={{
						rotate: "180deg",
					}}
				/>
			</ArrowRight>
		</Container>
	)
}
