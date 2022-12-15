import { FullscreenApiHelper, FullscreenEventType } from "@teawithsand/tws-stl"
import React, { CSSProperties, useEffect, useMemo, useState } from "react"
import styled, { css } from "styled-components"
import { GalleryBottomBar, GalleryMiddleBar, GalleryTopBar } from "./bar"
import {
	GalleryControlsContext,
	GalleryStateContext,
	useGalleryControls,
	useGalleryState,
} from "./context"
import { GalleryControls } from "./controls"
import { GalleryDisplayType, GalleryEntry, GalleryState } from "./defines"

const Container = styled.div<{
	$mode: GalleryDisplayType
}>`
	overflow: hidden;
	
	display: grid;
	grid-auto-flow: row;
	gap: 0.3em;
	${({ $mode }) =>
		$mode === GalleryDisplayType.MAIN
			? css`
					grid-template-rows: min-content minmax(0, 90%) max(
							10vh,
							10%
						);
			  `
			: css`
					grid-template-rows: 100%;
			  `}

	background-color: black;

	border: 2px solid rgba(0, 0, 0, 0.125);
	border-radius: 5px;

	box-sizing: border-box;

	& * {
		::-webkit-scrollbar {
			height: 6px;
			width: 6px;
			background: black;

			padding: 0;
			margin: 0;
		}

		::-webkit-scrollbar-thumb {
			background: white;
			-webkit-border-radius: 1ex;
			-webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);

			padding: 0;
			margin: 0;
		}

		::-webkit-scrollbar-corner {
			background: black;

			padding: 0;
			margin: 0;
		}

		@media (pointer: none) {
			::-webkit-scrollbar {
				display: none;
			}
		}
	}
`

export const AutonomousGallery = (props: {
	entries: GalleryEntry[]
	className?: string
	style?: CSSProperties
}) => {
	const { entries } = props
	const [innerCurrentEntryIndex, setCurrentEntryIndex] = useState(0)
	const [mode, setMode] = useState(GalleryDisplayType.MAIN)
	const [fsc, setFsc] = useState(false)
	const currentEntryIndex = entries.length ? innerCurrentEntryIndex : 0

	const controls: GalleryControls = useMemo(
		() => ({
			goToIth: (i) => {
				if (entries.length) {
					setCurrentEntryIndex(i % entries.length)
				} else {
					setCurrentEntryIndex(0)
				}
			},
			next: () => {
				if (entries.length) {
					setCurrentEntryIndex(
						(currentEntryIndex + 1) % entries.length
					)
				} else {
					setCurrentEntryIndex(0)
				}
			},
			prev: () => {
				if (entries.length) {
					setCurrentEntryIndex(
						Math.max(
							0,
							!currentEntryIndex
								? entries.length - 1
								: currentEntryIndex - 1
						)
					)
				} else {
					setCurrentEntryIndex(0)
				}
			},
			setMode: (mode) => {
				setMode(mode)
			},
			setFullscreen: (fsc) => {
				setFsc(fsc)
			},
		}),
		[currentEntryIndex, entries]
	)

	const state: GalleryState = useMemo(
		() => ({
			currentEntryIndex,
			entries,
			mode,
			isFullscreen: fsc,
		}),
		[entries, currentEntryIndex, mode, fsc]
	)

	return (
		<Gallery
			controls={controls}
			state={state}
			className={props.className}
			style={props.style}
		/>
	)
}

const InnerGallery = (props: { className?: string; style?: CSSProperties }) => {
	const isFsc = useGalleryState().isFullscreen

	const [element, setElement] = useState<HTMLDivElement | null>(null)

	const controls = useGalleryControls()

	useEffect(() => {
		FullscreenApiHelper.instance.bus.addSubscriber((s) => {
			if (s.type === FullscreenEventType.DISABLED) {
				controls.setFullscreen(false)
				controls.setMode(GalleryDisplayType.MAIN)
			}
		})
	}, [])

	useEffect(() => {
		if (!element) return

		if (isFsc) {
			if (!FullscreenApiHelper.instance.isFullscreen) {
				FullscreenApiHelper.instance.requestFullscreen(element)
			}
		} else {
			if (FullscreenApiHelper.instance.isFullscreen) {
				FullscreenApiHelper.instance.exitFullscreen()
			}
		}
	}, [isFsc])

	const state = useGalleryState()

	return (
		<Container
			ref={setElement}
			style={{
				...(props.style ?? {}),
				...(isFsc
					? {
							position: "absolute",
							top: 0,
							left: 0,
							zIndex: 100,

							// TODO(teawithsand): disable body margin/padding here or just prevent scrolling with
							// overflow hidden, but 1st solution is better.
							width: "100vw",
							height: "100vh",
					  }
					: {}),
			}}
			$mode={state.mode}
			className={props.className}
		>
			<GalleryTopBar
				style={{
					display:
						state.mode === GalleryDisplayType.ZOOM ? "none" : "",
				}}
			/>
			<GalleryMiddleBar />
			<GalleryBottomBar
				style={{
					display:
						state.mode === GalleryDisplayType.ZOOM ? "none" : "",
				}}
			/>
		</Container>
	)
}

export const Gallery = (props: {
	controls: GalleryControls
	state: GalleryState
	className?: string
	style?: CSSProperties
}) => {
	const { controls, state } = props

	return (
		<GalleryControlsContext.Provider value={controls}>
			<GalleryStateContext.Provider value={state}>
				<InnerGallery className={props.className} style={props.style} />
			</GalleryStateContext.Provider>
		</GalleryControlsContext.Provider>
	)
}
