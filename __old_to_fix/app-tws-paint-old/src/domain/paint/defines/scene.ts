import { PaintElement } from "@app/domain/paint/defines/element"
import { Color } from "@app/legacy/color"

export type PaintLayerOptions = {
	name: string
	isVisible: boolean
	isLocked: boolean
}

export type PaintLayer = {
	options: PaintLayerOptions
	elements: PaintElement[]
}

export type PaintSceneOptions = {
	// User-requested scene parameters
	sceneWidth: number
	sceneHeight: number

	// Offsets used for shifting all elements on scene
	//  Think of it as paint of SVG's view box
	//  Scene can be shrined using width/height and then we can display if's fragment with these props

	/**
	 * Note: for now these are always zero as I prefer to move user-display canvas via transform instead.
	 */
	offsetX: number

	/**
	 * Note: for now these are always zero as I prefer to move user-display canvas via transform instead.
	 */
	offsetY: number

	backgroundColor: Color
}

export type PaintScene = {
	options: PaintSceneOptions
	layers: PaintLayer[]
}
