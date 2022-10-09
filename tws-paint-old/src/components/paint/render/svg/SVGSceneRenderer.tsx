import React, { forwardRef, Ref } from "react"

import { SceneRendererProps } from "@app/components/paint/render/SceneRenderer"
import { SVGLayerRenderer } from "@app/components/paint/render/svg/SVGLayerRenderer"

import { encodeColor } from "@app/legacy/color"

const InnerRenderer = (
	props: SceneRendererProps & {
		style?: React.CSSProperties
		className?: string
	},
	ref: Ref<SVGSVGElement>,
) => {
	const { scene, presentationWidth, presentationHeight, style, className } =
		props

	const { options } = scene

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={presentationWidth}
			height={presentationHeight}
			style={{
				backgroundColor: encodeColor(scene.options.backgroundColor),
				...style,
			}}
			className={className}
			ref={ref}
			viewBox={`${options.offsetX} ${options.offsetY} ${options.sceneWidth} ${options.sceneHeight}`}
			onDragStart={e => {
				e.preventDefault()
				return false
			}}
			onDrag={e => {
				e.preventDefault()
				return false
			}}
		>
			{scene.layers.map((e, i) => (
				<SVGLayerRenderer layerIndex={i} layer={e} key={i} />
			))}
		</svg>
	)
}

export const SVGSceneRenderer = forwardRef(InnerRenderer)
