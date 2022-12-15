import { useGesture } from "@use-gesture/react"
import React, { CSSProperties, useEffect, useState } from "react"
import { CSSTransition } from "react-transition-group"
import styled, { css } from "styled-components"
import { useGalleryControls, useGalleryState } from "../context"
import {
	GalleryDisplayType,
	galleryDisplayTypeToGalleryEntryDisplayType,
	GalleryEntry,
} from "../defines"
import { GalleryEntryDisplay, GalleryEntryDisplayType } from "./item"

const transitionName = "dissolve"
const transitionDuration = 300

const transitionCss = css`
	.${transitionName}-enter {
		opacity: 0;
	}

	.${transitionName}-enter-active {
		opacity: 1;
		transition: opacity ${transitionDuration}ms;
	}

	.${transitionName}-enter-done {
		opacity: 1;
	}

	.${transitionName}-exit {
		opacity: 1;
	}

	.${transitionName}-exit-active {
		opacity: 0;
		transition: opacity ${transitionDuration}ms;
	}

	.${transitionName}-exit-done {
		opacity: 0;
	}
`

const Container = styled.div`
	display: grid;
	touch-action: none;

	& > * {
		grid-column: 1;
		grid-row: 1;
	}

	overflow: hidden;
	height: 100%;
`

// Apparently for some reason it's required
const OuterItemContainer = styled.div`
	${transitionCss}

	overflow: scroll;

	height: 100%;
	width: 100%;
`

type InnerItemContainerProps = {
	type: GalleryEntryDisplayType
}

const InnerItemContainer = styled.div<InnerItemContainerProps>`
	display: grid;
	align-items: center;
	justify-items: center;
	text-align: center;
	margin: auto;

	grid-template-rows: minmax(0, auto);
	grid-template-columns: minmax(0, auto);

	// Otherwise margin auto does not always center images, if they are not tall enough in zoom mode
	width: 100%;
	height: 100%;
	overflow: visible;
`

const Item = (props: {
	entry: GalleryEntry
	index: number
	visible: boolean
}) => {
	const { entry, visible } = props
	const type = galleryDisplayTypeToGalleryEntryDisplayType(
		useGalleryState().mode
	)
	return (
		<OuterItemContainer
			onDragStart={(e) => {
				e.preventDefault()
			}}
			style={{
				zIndex: visible ? 1 : 0,
			}}
		>
			<CSSTransition
				in={visible}
				timeout={transitionDuration}
				classNames={transitionName}
				mountOnEnter
				unmountOnExit
			>
				<InnerItemContainer type={type}>
					<GalleryEntryDisplay
						entry={entry}
						isActive={false}
						index={props.index}
						type={type}
					/>
				</InnerItemContainer>
			</CSSTransition>
		</OuterItemContainer>
	)
}

export const DefaultGalleryDisplay = (props: {
	style?: CSSProperties
	className?: string
}) => {
	const state = useGalleryState()
	const controls = useGalleryControls()

	const [isGalleryVisible, setIsGalleryVisible] = useState(false)
	const [outerContainer, setOuterContainer] = useState<HTMLDivElement | null>(
		null
	)

	const bind = useGesture({
		onDrag: ({ swipe: [swx, swy], intentional, tap }) => {
			if (intentional) {
				if (tap) {
					if (state.mode === GalleryDisplayType.MAIN) {
						controls.setMode(GalleryDisplayType.ZOOM)
					} else if (state.mode === GalleryDisplayType.ZOOM) {
						controls.setMode(GalleryDisplayType.MAIN)
					}
				} else if (swy === 0) {
					if (swx > 0) {
						controls.prev()
					} else if (swx < 0) {
						controls.next()
					}
				} else if (swx === 0) {
					if (swy > 0) {
						controls.setFullscreen(false)
					} else if (swy < 0) {
						controls.setFullscreen(true)
					}
				}
			}
		},
	})

	useEffect(() => {
		if (!outerContainer) return
		setIsGalleryVisible(false)

		const observer = new IntersectionObserver(
			(entries) => {
				setIsGalleryVisible(true)

				if (entries[0].isIntersecting) {
					setIsGalleryVisible(true)
				}
			},
			{
				threshold: [0.5],
			}
		)

		observer.observe(outerContainer)

		return () => {
			setIsGalleryVisible(false)
			observer.unobserve(outerContainer)
		}
	}, [setIsGalleryVisible, outerContainer])

	useEffect(() => {
		if (!outerContainer) return

		const keydown = (e: KeyboardEvent) => {
			if (!isGalleryVisible) return
			if (e.key === "ArrowRight") {
				controls.next()
			} else if (e.key === "ArrowLeft") {
				controls.prev()
			}
		}

		const scroll = (e: WheelEvent) => {
			if (
				state.mode === GalleryDisplayType.MAIN &&
				!e.ctrlKey &&
				!e.shiftKey
			) {
				if (e.deltaX > 0) {
					controls.next()
				} else if (e.deltaX < 0) {
					controls.prev()
				} else if (e.deltaY > 0) {
					controls.next()
				} else if (e.deltaY < 0) {
					controls.prev()
				}
			}
		}

		document.addEventListener("keydown", keydown)
		outerContainer.addEventListener("wheel", scroll)

		return () => {
			document.removeEventListener("keydown", keydown)
			outerContainer.removeEventListener("wheel", scroll)
		}
	}, [outerContainer, isGalleryVisible, controls, state.mode])

	useEffect(() => {
		if (!isGalleryVisible) return
		const l = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (state.mode === GalleryDisplayType.ZOOM) {
					controls.setMode(GalleryDisplayType.MAIN)
				}
			}
		}

		document.addEventListener("keydown", l)
		return () => {
			document.removeEventListener("keydown", l)
		}
	}, [state.mode, isGalleryVisible])

	return (
		<Container {...bind()} {...props} ref={setOuterContainer}>
			{state.entries.map((v, i) => (
				<Item
					key={i}
					entry={v}
					index={i}
					visible={i === state.currentEntryIndex}
				/>
			))}
		</Container>
	)
}
