import React from "react"
import styled, { keyframes } from "styled-components"

const spinAnimation = keyframes`
from {
	transform: rotate(0deg);
}
to {
	transform: rotate(360deg);
}
`

const SpinnerContainer = styled.div`
	margin-left: auto;
	margin-right: auto;
	width: fit-content;
`

const spinnerSize = 150
const spinnerMargin = (spinnerSize * (Math.sqrt(2) - 1)) / 2

const SpinnerImage = styled.svg`
	box-sizing: border-box;
	width: ${spinnerSize}px;
	height: ${spinnerSize}px;
	animation: ${spinAnimation} 2s cubic-bezier(0.1, 0.7, 1, 0.1) infinite;
	margin: ${spinnerMargin}px;
`

const SpinnerText = styled.div`
	text-align: center;
	font-size: 1.5em;
`

// TODO(teawithsand): obviously this should be part of tws-ui rather than tws-stl-react
// remove dependency on styled-components and move this implementation to other library
export const LoadingSpinner = (props: { text?: string }) => {
	const text = props.text ?? "Loading..."
	return (
		<SpinnerContainer>
			<SpinnerImage
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid slice"
				xmlns="http://www.w3.org/2000/svg"
				version="1.1"
			>
				<circle
					cx="22"
					cy="22"
					r="20"
					stroke="black"
					strokeWidth="2"
					fill="none"
				/>
				<circle
					cx="78"
					cy="78"
					r="20"
					stroke="black"
					strokeWidth="2"
					fill="none"
				/>
			</SpinnerImage>
			<SpinnerText>{text}</SpinnerText>
		</SpinnerContainer>
	)
}
