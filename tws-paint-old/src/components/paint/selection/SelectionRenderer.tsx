import { FC } from "react"

import { PaintScene } from "@app/domain/paint/defines"

export type SelectionRendererProps = {
	scene: PaintScene
	screenWidth: number
	screenHeight: number
	style?: React.CSSProperties
	className?: string
}

export type SelectionRenderer = FC<SelectionRendererProps>
