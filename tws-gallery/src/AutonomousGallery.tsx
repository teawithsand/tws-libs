import React, { useState } from "react"
import Gallery, { GalleryEntry, GalleryMode, GallerySize } from "./Gallery"

export type AutonomousGalleryProps = {
	entries: GalleryEntry[]
	size?: GallerySize // defaults to large for historic reasons
	enableKeyboardControls?: boolean
}

export const AutonomousGallery = (props: AutonomousGalleryProps) => {
	const { entries, enableKeyboardControls } = props

	const preferredSize = props.size ?? "large"

	const [mode, setMode] = useState<GalleryMode>("normal")
	const [realSize, setRealSize] = useState<GallerySize>(preferredSize)
	const [elementIndex, setElementIndex] = useState(0)

	const effectiveElementIndex =
		elementIndex < entries.length ? elementIndex : 0

	if (entries.length === 0) return <></>
	return (
		<Gallery
			entries={entries}
			currentEntryIndex={effectiveElementIndex}
			mode={mode}
			size={realSize}
			enableKeyboardControls={
				(enableKeyboardControls ?? false) || realSize === "fullscreen"
			}
			onCurrentEntryTap={() => {
				if (realSize === preferredSize) {
					setRealSize("fullscreen")
				} else if (realSize === "fullscreen" && mode === "normal") {
					setMode("image-only")
				} else {
					setRealSize(preferredSize)
					setMode("normal")
				}
			}}
			onFullscreenToggleRequested={() => {
				if (realSize !== "fullscreen") {
					setRealSize("fullscreen")
				} else {
					setRealSize(preferredSize)
					setMode("normal")
				}
			}}
			onFullscreenExit={() => {
				setRealSize(preferredSize)
				setMode("normal")
			}}
			onSwipeRight={() => {
				setElementIndex((effectiveElementIndex + 1) % entries.length)
			}}
			onSwipeLeft={() => {
				setElementIndex(
					effectiveElementIndex - 1 >= 0
						? effectiveElementIndex - 1
						: entries.length - 1,
				)
			}}
			onSwipeTop={() => {
				setMode("normal")
			}}
			onSwipeBottom={() => {
				setMode("image-only")
			}}
			onBottomEntryTap={i => {
				setElementIndex(i)
			}}
		/>
	)
}
