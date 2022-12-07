import React, { ReactNode, useEffect, useMemo } from "react"
import styled from "styled-components"
import { galleryDimensions } from "./dimensions"
import GalleryBottomBar from "./GalleryBottomBar"
import GalleryTopBar from "./GalleryTopBar"

const GalleryContainer = styled.div.attrs(
	(props: {
		$galleryHeight: string
		$fullscreen: boolean
		$isMiddleOnly: boolean
	}) => ({
		style: {
			[galleryDimensions.heightVar]: props.$galleryHeight,
			...(props.$fullscreen
				? {
						position: "fixed",
						zIndex: 1000,
						width: "100vw",
						height: "100vh",
						top: 0,
						left: 0,
						borderRadius: 0, // otherwise user is able to see background of body in corners
				  }
				: {}),
		},
	}),
)`
	display: grid;
	grid-template-columns: auto;
	// Note: middle row(the one with elements) has to have height defined independently of it's content
	// so JS measuring code works
	grid-template-rows: ${({ $isMiddleOnly }: { $isMiddleOnly: boolean }) =>
		$isMiddleOnly
			? `${galleryDimensions.topBarHeight}`
			: `${galleryDimensions.topBarHeight} ${galleryDimensions.middleBarHeight} ${galleryDimensions.bottomBarHeight}}`};

	${galleryDimensions.topBarHeightVar}: ${galleryDimensions.topBarHeight};
	${galleryDimensions.middleBarHeightVar}: ${galleryDimensions.middleBarHeight};
	${galleryDimensions.bottomBarHeightVar}: ${galleryDimensions.bottomBarHeight};

	background-color: black;
	border-radius: 5px;
	color: white;
	padding: 5px;

	// Bunch of global styles
	// to fix gatsby stuff
	& .gatsby-image-wrapper [data-main-image] {
		will-change: initial !important;
	}

	& img,
	& *.gatsby-image-wrapper > img,
	& *.gatsby-image-wrapper > picture > img {
		image-rendering: auto;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: smooth;
		image-rendering: high-quality;
	}
`

export type GallerySize = "large" | "medium" | "fullscreen" | string
export type GalleryMode = "normal" | "image-only"

export type GalleryEntry = {
	mainDisplay: ReactNode
}

export type GalleryProps = {
	entries: GalleryEntry[]
	currentEntryIndex: number
	size: GallerySize
	mode: GalleryMode
	enableKeyboardControls: boolean

	onFullscreenExit: () => void
	onFullscreenToggleRequested: () => void
	onCurrentEntryTap: () => void
	onBottomEntryTap: (to: number) => void
	onSwipeRight: () => void
	onSwipeLeft: () => void
	onSwipeTop: () => void
	onSwipeBottom: () => void
}

// TODO(teawithsand): make this gallery work better with zooming

export const Gallery = (props: GalleryProps) => {
	const {
		entries,
		currentEntryIndex,
		onBottomEntryTap,
		onSwipeRight,
		onSwipeLeft,
		onSwipeTop,
		onSwipeBottom,
		onCurrentEntryTap,
		onFullscreenExit,
		onFullscreenToggleRequested,
		enableKeyboardControls,
		size,
		mode,
	} = props

	const mappedEntries = useMemo(
		() => entries.map(e => e.mainDisplay),
		[entries],
	)

	const fsc = useFullscreen({
		onExit: () => {
			onFullscreenExit()
		},
	})

	useEffect(() => {
		if (size === "fullscreen") {
			fsc.enter()
		} else {
			fsc.exit()
		}
	}, [size])

	const getHeight = () => {
		if (fsc.isFullscreen || size === "fullscreen") {
			return "100vh"
		} else if (size === "large") {
			return "80vh"
		} else if (size === "medium") {
			return "60vh"
		} else {
			return size
		}
	}

	useEffect(() => {
		if (enableKeyboardControls) {
			const listener = (e: any) => {
				if (e.key === "ArrowRight") {
					onSwipeRight()
				} else if (e.key === "ArrowLeft") {
					onSwipeLeft()
				}
			}
			document.addEventListener("keydown", listener)

			return () => {
				document.removeEventListener("keydown", listener)
			}
		}
	}, [enableKeyboardControls, onSwipeRight, onSwipeLeft])

	return (
		<GalleryContainer
			{...({
				$galleryHeight: getHeight(),
				$fullscreen: fsc.isFullscreen || size === "fullscreen",
				$isMiddleOnly: mode !== "normal",
			} as any)}
		>
			{mode === "normal" ? (
				<GalleryTopBar
					currentEntryIndex={currentEntryIndex}
					entryCount={mappedEntries.length}
					onToggleFullscreen={() => {
						onFullscreenToggleRequested()
					}}
				/>
			) : null}
			<GalleryMiddleBar
				entries={mappedEntries}
				currentItemIndex={currentEntryIndex}
				onTap={onCurrentEntryTap}
				onSwipe={direction => {
					if (direction === "left") {
						onSwipeLeft()
					} else if (direction === "right") {
						onSwipeRight()
					} else if (direction === "top") {
						onSwipeTop()
					} else if (direction === "bottom") {
						onSwipeBottom()
					}
				}}
			/>
			{mode === "normal" ? (
				<GalleryBottomBar
					entries={mappedEntries}
					onElementClick={onBottomEntryTap}
					currentEntryIndex={currentEntryIndex}
				/>
			) : null}
		</GalleryContainer>
	)
}

export default Gallery
