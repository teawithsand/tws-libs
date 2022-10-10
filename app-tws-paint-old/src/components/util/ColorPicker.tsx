import React from "react"
import { Form } from "react-bootstrap"

import { Color, encodeColorForInput, parseColor } from "@app/legacy/color"

export const ColorPickerInput = (props: {
	value: Color
	onChange?: (color: Color) => void
}) => {
	return (
		<Form.Control
			type="color"
			value={encodeColorForInput(props.value)}
			onChange={(e: any) => {
				const v = e.target.value
				if (props.onChange) {
					props.onChange(parseColor(v))
				}
			}}
		/>
	)
}
