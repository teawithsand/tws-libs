import React from "react"
import styled from "styled-components"

import { SVGElementRenderer } from "@app/components/paint/render/svg/SVGElementRenderer"
import { PaintLayer } from "@app/domain/paint/defines"

const Group = styled.g``

const InnerRenderer = (props: { layer: PaintLayer; layerIndex: number }) => {
	const { layer } = props

	return (
		<Group>
			{layer.elements.map((v, i) => (
				<SVGElementRenderer
					element={v}
					key={i}
					layerIndex={props.layerIndex}
					elementIndex={i}
				/>
			))}
		</Group>
	)
}

export const SVGLayerRenderer = InnerRenderer
