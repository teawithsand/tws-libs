import { throwExpression } from "@teawithsand/tws-stl"
import { createContext, useContext } from "react"
import { GalleryEntryDisplayType } from "./item"

export type GalleryEntryDisplayData = {
	isActive: boolean
	index: number
	displayType: GalleryEntryDisplayType
	fullscreen: boolean
}

export const GalleryEntryDisplayContext =
	createContext<GalleryEntryDisplayData | null>(null)

export const useGalleryEntryDisplayData = (): GalleryEntryDisplayData =>
	useContext(GalleryEntryDisplayContext) ??
	throwExpression(new Error(`GalleryStateContext is not available`))
