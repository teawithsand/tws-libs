import { Color, encodeColor } from "@app/legacy/color"
import React from "react"
import styled from "styled-components"

const Background = styled.div`
	background-image: linear-gradient(45deg, #808080 25%, transparent 25%),
		linear-gradient(-45deg, #808080 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #808080 75%),
		linear-gradient(-45deg, transparent 75%, #808080 75%);
	background-size: 20px 20px;
	background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

	background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% /
		20px 20px;
`

const Foreground = styled.div`
	z-index: 1;
	background-color: var(--color-picker-color);
`

const inverseColor = (color: Color): Color => {
	if (color.length === 3) {
		return color.map(v => 255 - v) as Color
	} else {
		return [...color.slice(0, 3).map(v => 255 - v), color[3]] as Color
	}
}

const Preview = styled.div.attrs<{
	$color: Color
}>(props => ({
	style: {
		"--color-picker-color": encodeColor(props.$color),
		"--color-picker-border-color": encodeColor(inverseColor(props.$color)),
	},
}))<{
	$color: Color
}>`
	display: block;
	position: relative;

	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

	border: 2px solid black;
	border-radius: 0.25rem;
	overflow: hidden;

	width: 3rem;
	height: 2rem;

	& > * {
		position: absolute;
		width: 100%;
		height: 100%;

		top: 0;
		left: 0;
	}
`

export const ColorPreview = (props: { color: Color }) => {
	return (
		<Preview $color={props.color}>
			<Foreground></Foreground>
			<Background></Background>
		</Preview>
	)
}
