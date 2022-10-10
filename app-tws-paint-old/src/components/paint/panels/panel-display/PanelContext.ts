import { throwExpression } from "@teawithsand/tws-stl"
import { createContext, useContext } from "react"

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
