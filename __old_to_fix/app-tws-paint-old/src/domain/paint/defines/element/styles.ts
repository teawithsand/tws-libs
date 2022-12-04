import { CSSProperties } from "react"

import { PaintElementCommonOptions } from "@app/domain/paint/defines/element/element"

export const renderElementTransformAndFilter = (
	commonOptions: PaintElementCommonOptions,
): {
	filter: CSSProperties["filter"]
	transform: CSSProperties["transform"]
} => {
	const finalTransformX = commonOptions.local.selection.selectionTranslateX
	const finalTransformY = commonOptions.local.selection.selectionTranslateX

	return {
		filter: [
			// first apply selection filters
			`rotate(${commonOptions.local.selection.selectionRotation}deg)`,
			`scaleX(${commonOptions.local.selection.selectionScaleX})`,
			`scaleY(${commonOptions.local.selection.selectionScaleY})`,
			...commonOptions.filters
				.map(v => renderFilterForFilter(v))
				.filter(v => !!v),
			...(commonOptions.local.removal.isMarkedForRemoval
				? [
						renderFilterForFilter({
							type: PaintFilterType.OPACITY,
							factor: 0.5,
						}),
				  ]
				: []),
		].join(" "),
		transform: `translateX(${finalTransformX}px) translateY(${finalTransformY})`, // TODO(teawithsand): here apply transform from filters
	}
}

export enum PaintFilterType {
	SCALE = "scale",
	OPACITY = "opacity",
}

export type PaintFilter =
	| {
			type: PaintFilterType.SCALE
			factorX: number
			factorY: number
	  }
	| {
			type: PaintFilterType.OPACITY
			factor: number // between 0 and 1
	  }

const renderFilterForFilter = (filter: PaintFilter): string => {
	if (filter.type === PaintFilterType.OPACITY) {
		return `opacity(${filter.factor * 100}%)`
	} else if (filter.type === PaintFilterType.SCALE) {
		return "" // it's for transform
	}
	{
		throw new Error(`Unknown filter type ${(filter as any).type}`)
	}
}

const renderFilterForTransform = (filter: PaintFilter): string => {
	if (filter.type === PaintFilterType.OPACITY) {
		return ""
	} else if (filter.type === PaintFilterType.SCALE) {
		return `scale(${filter.factorX}, ${filter.factorY})`
	} else {
		throw new Error(`Unknown filter type ${(filter as any).type}`)
	}
}
