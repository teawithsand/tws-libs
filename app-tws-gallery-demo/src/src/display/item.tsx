import React from "react"
import { GalleryEntry } from "../defines"
import { GalleryEntryDisplayContext } from "./context"

export enum GalleryEntryDisplayType {
	MAIN = 1,
	ZOOM = 2,
	THUMBNAIL = 3,
}

export const GalleryEntryDisplay = (props: {
	entry: GalleryEntry
	index: number
	isActive: boolean
	type?: GalleryEntryDisplayType
}) => {
	const { entry, type, index, isActive } = props

	return (
		<GalleryEntryDisplayContext.Provider
			value={{
				displayType: type ?? GalleryEntryDisplayType.MAIN,
				fullscreen: false,
				index,
				isActive,
			}}
		>
			{entry.display}
		</GalleryEntryDisplayContext.Provider>
	)
}
