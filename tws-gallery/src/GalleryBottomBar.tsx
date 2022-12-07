import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { galleryDimensions } from "tws-common/react/components/gallery/dimensions";


const InnerGalleryBottomBar = styled.div.attrs(
	({ $visible }: { $visible: boolean }) => ({
		style: {
			...(!$visible ? { display: "none" } : {}),
		},
	}),
)`
	grid-row: 3;
	grid-column: 1;

	overflow-x: visible;
	overflow-y: hidden;

	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: minmax(100px, 1fr);
	column-gap: 0.8rem;

	& *:first-child {
		margin-left: 10px;
	}
	& *:last-child {
		margin-right: 10px;
	}

	// Make items non selectable and prevent fancy stuff with touch-action: none
	& * {
		user-select: none;
		::selection {
			background: transparent;
		}
		touch-action: none;

		-webkit-user-drag: none;
		-khtml-user-drag: none;
		-moz-user-drag: none;
		-o-user-drag: none;
		user-drag: none;
	}

	// Make all scrollbar pretty
	& {
		&::-webkit-scrollbar {
			height: 6px;
			width: 6px;
			background: black;
		}

		&::-webkit-scrollbar-thumb {
			background: white;
			border-radius: 12px;
			box-shadow: 0px 1px 2px rgba(255, 255, 255, 0.75);
		}

		&::-webkit-scrollbar-corner {
			background: black;
		}

		scrollbar-color: white black;
		scrollbar-width: thin;

		scroll-behavior: smooth;
	}
`

// TODO(teawithsand): optimize it so it does not has to generate classes for each screen size
//  that being said, it's ok to leave it as is, since users do not resize their screens that often(I guess...)
const GalleryBottomBarItemContainer = styled.div.attrs(
	({ $clickable, $active }: { $clickable: boolean; $active: boolean }) => ({
		style: {
			cursor: $clickable ? "pointer" : "initial",
			...($active
				? {
						boxShadow: "0px 0px 12px 3px rgba(255, 255, 255, 1)",
				  }
				: {}),
		},
	}),
)`
	margin: 0;
	padding: 0;
	margin-left: auto;
	margin-right: auto;
	box-sizing: content-box;

	text-align: center;

	overflow: hidden; // just for safety, in case something goes wrong or image decides to ignore our max height

	margin-top: 0.6rem;
	margin-bottom: 0.6rem;

	& > * {
		box-sizing: border-box;
		height: calc(var(${galleryDimensions.bottomBarHeightVar}) - 1.2rem);
	}
`

// Apparently eslint thinks that this react fn has no name
// eslint-disable-next-line react/display-name
const GalleryBottomBarItem = React.forwardRef(
	(
		props: {
			entry: ReactNode
			onClick?: () => void
			index: number
			active: boolean
		},
		ref,
	) => {
		const { entry, onClick, index, active } = props
		return (
			<GalleryBottomBarItemContainer
				data-index={index}
				ref={ref}
				onClick={onClick}
				{...({ $clickable: !!onClick, $active: active } as any)}
			>
				{entry}
			</GalleryBottomBarItemContainer>
		)
	},
)

const GalleryBottomBar = (props: {
	entries: ReactNode[]
	currentEntryIndex: number
	onElementClick?: (index: number) => void
	visible?: boolean // defaults to true
}) => {
	const { entries, onElementClick, visible, currentEntryIndex } = props
	const [dimensions, setDimensions] = useState<[number, number] | null>(null)

	const newTargetScroll = useRef(0)

	const isContainerVisibleRef = useRef(false)

	const [container, setContainer] = useState<HTMLDivElement | null>(null)

	useEffect(() => {
		const current = container
		if (current) {
			const observer = new ResizeObserver(() => {
				const width = current.clientWidth
				const height = current.clientHeight
				setDimensions([width, height])
			})
			observer.observe(current)

			newTargetScroll.current = current.scrollLeft

			const listener = (e: any) => {
				e.preventDefault()

				// or make single scroll pull single image to view
				// can be easily done using scrollToView method
				newTargetScroll.current = Math.max(
					0,
					Math.min(
						newTargetScroll.current + e.deltaY,
						current.scrollWidth,
					),
				)
				current.scrollLeft = newTargetScroll.current
			}

			current.addEventListener("wheel", listener)

			return () => {
				current.removeEventListener("wheel", listener)
				observer.unobserve(current)
			}
		}
	}, [container])

	useEffect(() => {
		const current = container
		isContainerVisibleRef.current = false
		if (current) {
			const observer = new IntersectionObserver(
				entries => {
					isContainerVisibleRef.current = entries[0].isIntersecting
				},
				{
					threshold: [1],
				},
			)

			observer.observe(current)

			return () => {
				isContainerVisibleRef.current = false
				observer.unobserve(current)
			}
		}
	}, [container])

	useLayoutEffect(() => {
		const current = container
		if (current && isContainerVisibleRef.current) {
			const res = current.querySelector(
				`*[data-index="${currentEntryIndex}"]`,
			)
			if (res) {
				res.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				})
			}
		}
	}, [currentEntryIndex, container])

	return (
		<InnerGalleryBottomBar
			ref={setContainer}
			{...({
				$itemHeight: dimensions ? dimensions[1] : null,
				$visible: visible ?? true,
			} as any)}
		>
			{entries.map((v, i) => (
				<GalleryBottomBarItem
					entry={v}
					index={i}
					key={i}
					active={i === currentEntryIndex}
					onClick={
						onElementClick ? () => onElementClick(i) : undefined
					}
				/>
			))}
		</InnerGalleryBottomBar>
	)
}
export default GalleryBottomBar