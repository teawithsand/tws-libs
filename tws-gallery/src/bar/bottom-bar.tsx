import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import styled, { css } from "styled-components"
import { useGalleryControls, useGalleryState } from "../context"
import { GalleryEntryDisplay, GalleryEntryDisplayType } from "../display"

const InnerContainer = styled.div`
	display: flex;
	gap: 2.5%;
	flex-flow: row nowrap;

	overflow: hidden;
	overflow-x: visible;

	padding-left: 2.5%;
	padding-right: 2.5%;
	padding-bottom: .3em;
	padding-top: .3em;

	width: 100%;
	height: calc(100% - .3em - .3em);
`

const OuterContainer = styled.div`
	overflow: hidden;

	width: 100%;
	height: 100%;

	user-select: none;
`

const ItemContainer = styled.div<{
	$isActive: boolean
}>`
	margin-left: auto;
	margin-right: auto;

	flex: 0 0 20%;
	@media (max-width: 500px) {
		flex: 0 0 33%;
	}

	overflow: hidden;
	border: 1px solid white;
	border-radius: 10px; // this is hack, but should work

	transition: width 300ms, border-radius 300ms;
	&:hover {
		width: 100%;
	}

	${({ $isActive }) =>
		$isActive &&
		css`
			width: 90%;
			border-left: 2px solid white;
			border-right: 2px solid white;
			border-radius: 25px;
		`}
`

export const GalleryBottomBar = (props: {
	style?: CSSProperties
	className?: string
}) => {
	const state = useGalleryState()
	const controls = useGalleryControls()

	const [outerContainer, setOuterContainer] = useState<HTMLElement | null>(
		null
	)

	const isContainerVisibleRef = useRef(false)

	const scrollChild = useCallback(() => {
		if (!outerContainer) return
		const child = outerContainer.querySelector(
			`*[data-item-index="${state.currentEntryIndex}"]`
		)

		if (child) {
			child.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			})
		}
	}, [state.currentEntryIndex, outerContainer])

	useEffect(() => {
		if (!outerContainer) return
		isContainerVisibleRef.current = false

		const observer = new IntersectionObserver(
			(entries) => {
				isContainerVisibleRef.current = entries[0].isIntersecting

				if (entries[0].isIntersecting) {
					scrollChild()
				}
			},
			{
				threshold: [1],
			}
		)

		observer.observe(outerContainer)

		return () => {
			isContainerVisibleRef.current = false
			observer.unobserve(outerContainer)
		}
	}, [scrollChild, outerContainer])

	useLayoutEffect(() => {
		if (isContainerVisibleRef.current) scrollChild()
	}, [scrollChild])

	return (
		<OuterContainer ref={setOuterContainer} {...props}>
			<InnerContainer>
				{state.entries.map((v, i) => (
					<ItemContainer
						key={i}
						onClick={() => {
							controls.goToIth(i)
						}}
						$isActive={state.currentEntryIndex === i}
						{...{
							"data-item-index": `${i}`,
						}}
					>
						<GalleryEntryDisplay
							index={i}
							isActive={true}
							entry={v}
							type={GalleryEntryDisplayType.THUMBNAIL}
						/>
					</ItemContainer>
				))}
			</InnerContainer>
		</OuterContainer>
	)
}
