import { throwExpression } from "@teawithsand/tws-stl"
import { createContext, useContext } from "react"
import { GalleryControls } from "./controls"
import { GalleryState } from "./defines"

export const GalleryStateContext = createContext<GalleryState | null>(null)
export const useGalleryState = (): GalleryState =>
	useContext(GalleryStateContext) ??
	throwExpression(new Error(`GalleryStateContext is not available`))

export const GalleryControlsContext = createContext<GalleryControls | null>(
	null
)
export const useGalleryControls = (): GalleryControls =>
	useContext(GalleryControlsContext) ??
	throwExpression(new Error(`GalleryControlsContext is not available`))