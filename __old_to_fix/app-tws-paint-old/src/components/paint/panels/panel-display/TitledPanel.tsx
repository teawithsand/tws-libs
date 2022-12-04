import React, { CSSProperties, ReactNode } from "react"
import styled from "styled-components"

const Container = styled.div`
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: auto auto;

	justify-items: center;
	align-items: center;

	grid-auto-flow: row;
`

const TitleContainer = styled.div`
	grid-row: 1;
	text-align: center;
	font-size: 2rem;
	font-weight: bold;

	margin-bottom: 1rem;
	width: 100%;
`
const PanelContainer = styled.div`
	grid-row: 2;
	width: 100%;
`

export const TitledPanel = (props: {
	title: string
	className?: string
	style?: CSSProperties
	children?: ReactNode
}) => {
	return (
		<Container className={props.className} style={props.style}>
			<TitleContainer>{props.title}</TitleContainer>
			<PanelContainer>{props.children}</PanelContainer>
		</Container>
	)
}
