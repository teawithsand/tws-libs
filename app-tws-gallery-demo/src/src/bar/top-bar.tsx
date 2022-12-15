import { CSSProperties } from "react"
import styled, { css } from "styled-components"
import { useGalleryControls, useGalleryState } from "../context"
import React from "react"

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr auto 1fr;

	color: white;
`

const centerCss = css`
	display: grid;
	justify-content: center;
	align-self: center;
	text-align: center;
`

const Left = styled.div`
	${centerCss}
`

const Center = styled.div`
	${centerCss}
`

const Right = styled.div`
	${centerCss}
`

const Btn = styled.div`
	display: inline-block;

	height: 1.5em;
	width: 1.5em;
	cursor: pointer;

	& svg * {
		fill: white;
	}
`

export const GalleryTopBar = (props: {
	style?: CSSProperties
	className?: string
}) => {
	const state = useGalleryState()
	const controls = useGalleryControls()

	return (
		<Container {...props}>
			<Left>
				{state.entries.length ? (
					<>
						{state.currentEntryIndex + 1}/{state.entries.length}
					</>
				) : null}
			</Left>
			<Center>
				Name: 
				{state.entries.length
					? state.entries[state.currentEntryIndex]?.title || null
					: null}
			</Center>
			<Right>
				<Btn
					onClick={() => {
						controls.setFullscreen(!state.isFullscreen)
					}}
				>
					<svg version="1.1" viewBox="0 0 384.97 384.97">
						<g>
							<g>
								<path
									d="M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
			S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
			c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z"
								/>
								<path
									d="M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
			c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
			s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z"
								/>
							</g>
						</g>
					</svg>
				</Btn>
			</Right>
		</Container>
	)
}
