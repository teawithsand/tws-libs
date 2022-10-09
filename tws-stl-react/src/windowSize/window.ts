import { Orientation, ScreenDimensions } from "."
import { requireNoSsr } from "../ssr"
import { useEffect, useState } from "react"

// TODO(teawithsand): refactor me
type WindowDimensions = ScreenDimensions

export const getWindowDimensions = (): WindowDimensions => {
	const { innerWidth: width, innerHeight: height } = window
	let orientation: Orientation = "square"
	if (width > height) {
		orientation = "horizontal"
	} else if (height > width) {
		orientation = "vertical"
	}
	return {
		width,
		height,
		orientation,
	}
}

export const useWindowDimensions = (
	ssrInitialize?: WindowDimensions
): WindowDimensions => {
	if (!ssrInitialize) requireNoSsr()

	const [windowDimensions, setWindowDimensions] = useState(
		() => ssrInitialize ?? getWindowDimensions()
	)

	useEffect(() => {
		function handleResize() {
			const dimensions = getWindowDimensions()
			setWindowDimensions(dimensions)
		}

		handleResize()

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [setWindowDimensions])

	return windowDimensions
}
