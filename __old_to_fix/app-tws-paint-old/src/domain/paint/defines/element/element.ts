import { HandDrawnPathPaintElement } from "@app/domain/paint/defines/element/path"
import { PaintFilter } from "@app/domain/paint/defines/element/styles"
import { TextPaintElement } from "@app/domain/paint/defines/element/text"

export enum PaintElementType {
	// TODO(teawithsand): rename it to brush path
	HAND_DRAWN_PATH = "hand-drawn-path",
	TEXT = "text",
}

// TODO(teawithsand): create element comparing function

export type PaintElement = (
	| ({
			type: PaintElementType.HAND_DRAWN_PATH
	  } & HandDrawnPathPaintElement)
	| ({
			type: PaintElementType.TEXT
	  } & TextPaintElement)
) & {
	commonOptions: PaintElementCommonOptions
}

export const defaultPaintElementCommonOptions: PaintElementCommonOptions = {
	filters: [],
	visible: true,

	local: {
		removal: {
			isMarkedForRemoval: false,
		},
		selection: {
			isSelected: false,
			selectionRotation: 0,
			selectionScaleX: 1,
			selectionScaleY: 1,
			selectionTranslateX: 0,
			selectionTranslateY: 0,
		},
	},
}

export type PaintElementCommonOptions = {
	visible?: boolean // defaults to true

	filters: PaintFilter[]

	local: {
		selection: {
			isSelected: boolean // defaults to false
			selectionRotation: number // degrees
			selectionScaleX: number
			selectionScaleY: number
			selectionTranslateX: number
			selectionTranslateY: number
		}
		removal: {
			isMarkedForRemoval: boolean // defaults to false
		}
	}
}
