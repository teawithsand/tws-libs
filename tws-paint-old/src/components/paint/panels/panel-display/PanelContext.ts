import { createContext, useContext } from "react"

import { throwExpression } from "tws-common/lang/throw"

export enum PaintPanelPlace {
	SIDE_PANEL = "side-panel",
	SCREEN = "screen",
}

export type PaintPanelDisplayContextData = {
	place: PaintPanelPlace
}

export const PaintPanelDisplayContext =
	createContext<PaintPanelDisplayContextData | null>(null)

export const usePaintPanelContext = (): PaintPanelDisplayContextData => {
	return (
		useContext(PaintPanelDisplayContext) ??
		throwExpression(new Error("PaintPanelDisplayContext not provided"))
	)
}
