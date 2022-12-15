import { ReactNode } from "react"
import { GalleryEntryDisplayType } from "./display"

export enum GallerySizeType {
	FIXED_HEIGHT = 1,
	PROPORTIONAL = 2,
}

export type GallerySize = {
	type: GallerySizeType.FIXED_HEIGHT
	height?: string // defaults to 100%
}

export type GalleryEntryMetadata = {
	title?: string
}

export type GalleryEntry = GalleryEntryMetadata & {
	display: ReactNode
}

export enum GalleryDisplayType {
	MAIN = 1,
	ZOOM = 2,
}

export const galleryDisplayTypeToGalleryEntryDisplayType = (
	mode: GalleryDisplayType
): GalleryEntryDisplayType => {
	if (mode === GalleryDisplayType.MAIN) {
		return GalleryEntryDisplayType.MAIN
	} else if (mode === GalleryDisplayType.ZOOM) {
		return GalleryEntryDisplayType.ZOOM
	} else {
		throw new Error(`Unreachable code`)
	}
}

export type GalleryState = {
	mode: GalleryDisplayType

	entries: GalleryEntry[]
	currentEntryIndex: number // ignored if entries are empty; aside from that case, always points to valid entry
	isFullscreen: boolean
}
