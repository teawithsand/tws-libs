import { useGesture } from "@use-gesture/react"
import React, { ReactNode, useRef } from "react"
import { CSSTransition } from "react-transition-group"
import styled from "styled-components"

import { galleryDimensions } from "tws-common/react/components/gallery/dimensions"

const transitionName = "dissolve"
const transitionDuration = 300

// TODO(teawithsand): optimize it so it does not has to generate classes for each screen size
//  that being said, it's ok to leave it as is, since users do not resize their screens that often(I guess...)
const GalleryMiddleBarItemContainer = styled.div`
	grid-row: 1;
	grid-column: 1;

	margin: auto;
	padding: 0; // this is required for proper usage of $itemHeight
	box-sizing: border-box;

	max-height: var(${galleryDimensions.middleBarHeightVar});
	max-width: 100%;

	text-align: center;

	& > * {
		box-sizing: border-box;
		max-height: inherit;
	}

	.${transitionName}-enter {
		opacity: 0;
	}

	.${transitionName}-enter-active {
		opacity: 1;
		transition: opacity ${transitionDuration}ms;
	}

	.${transitionName}-exit {
		opacity: 1;
	}

	.${transitionName}-exit-active {
		opacity: 0;
		transition: opacity ${transitionDuration}ms;
	}
`

const OuterGalleryMiddleBar = styled.div`
	grid-row: 2;
	grid-column: 1;

	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr;
`

const GoToPrevElement = styled.div`
	&::before {
		content: "<";
	}
	grid-row: 1;
	grid-column: 1;

	display: flex;
	align-items: center;
	justify-content: center;

	width: 40px;
	font-size: 40px;

	overflow: hidden;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.1);
	z-index: 2;

	opacity: 0;

	transition: opacity 300ms;

	&:hover {
		opacity: 1;
	}
`

const GoToNextElement = styled.div`
	&::before {
		content: ">";
	}
	margin-left: auto;

	grid-row: 1;
	grid-column: 1;

	display: flex;
	align-items: center;
	justify-content: center;

	width: 40px;
	font-size: 40px;

	overflow: hidden;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.1);
	z-index: 2;

	opacity: 0;

	transition: opacity 300ms;
	&:hover {
		opacity: 1;
	}
`

const InnerGalleryMiddleBar = styled.div.attrs(
	({ $visible }: { $visible: boolean }) => ({
		style: {
			...(!$visible ? { display: "none" } : {}),
		},
	}),
)`
	grid-row: 1;
	grid-column: 1;

	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr;

	touch-action: none;
	cursor: move;

	// apparently fixes bug in firefox, which causes resize listener not to be triggered
	// when we exit fullscreen, if this is not set
	overflow: hidden;

	box-sizing: border-box;
	padding: 0; // required, since we are are using JS to measure this element's dimensions.
	// margin: 0; // margins are fine though

	width: 100%; // required, since we are are using JS to measure this element's dimensions.
	height: 100%; // required, since we are are using JS to measure this element's dimensions.
`

const GalleryMiddleBarItem = (props: {
	entry: ReactNode
	visible: boolean
}) => {
	const { entry, visible } = props
	return (
		<GalleryMiddleBarItemContainer
			style={{
				zIndex: visible ? 1 : 0,
			}}
		>
			<CSSTransition
				in={visible}
				timeout={transitionDuration}
				classNames={transitionName}
				unmountOnExit
			>
				{() => entry}
			</CSSTransition>
		</GalleryMiddleBarItemContainer>
	)
}

const GalleryMiddleBar = (props: {
	entries: ReactNode[]
	currentItemIndex: number

	visible?: boolean // defaults to true
	onSwipe?: (direction: "left" | "right" | "top" | "bottom") => void
	onTap?: () => void
}) => {
	const { currentItemIndex, entries, onSwipe, onTap, visible } = props
	const ref = useRef<HTMLDivElement | null>(null)
	const bind = useGesture(
		{
			onDrag: data => {
				const {
					swipe: [swx, swy],
					intentional,
					tap,
				} = data as any // it looks like @use-gesture/react has something broken with ts typings, so leave this as-is with this any cast
				if (intentional) {
					if (tap) {
						if (onTap) onTap()
					} else if (swy === 0 && swx !== 0) {
						if (onSwipe) {
							if (swx < 0) onSwipe("left")
							else onSwipe("right")
						}
					} else if (swx === 0 && swy !== 0) {
						if (onSwipe) {
							if (swy < 0) onSwipe("top")
							else onSwipe("bottom")
						}
					}
				}
			},

			// TODO(teawithsand): entering zoom/full mode on pinch
			onPinch: () => {
				return
			},
		},
		{
			drag: {
				filterTaps: false,
				preventDefault: true,
			},
			pinch: {},
		},
	) as unknown as () => Record<string, unknown>

	return (
		<OuterGalleryMiddleBar>
			<GoToPrevElement
				onClick={() => {
					if (onSwipe) onSwipe("left")
				}}
			></GoToPrevElement>
			<InnerGalleryMiddleBar
				// these lines are ok
				// despite the fact that any cast is needed
				ref={ref as any}
				{...({
					$visible: visible ?? true,
				} as any)}
				{...bind()}
			>
				{entries.map((v, i) => (
					<GalleryMiddleBarItem
						entry={v}
						key={i}
						visible={i === currentItemIndex}
					/>
				))}
			</InnerGalleryMiddleBar>
			<GoToNextElement
				onClick={() => {
					if (onSwipe) onSwipe("right")
				}}
			></GoToNextElement>
		</OuterGalleryMiddleBar>
	)
}

export default GalleryMiddleBar
