import { Orientation, ScreenDimensions } from "."
import { requireNoSsr } from "../ssr"
import { useEffect, useState } from "react"

// TODO(teawithsand): refactor me
type ClientDimensions = ScreenDimensions

export const getClientDimensions = () => {
	const { clientWidth: width, clientHeight: height } = document.body

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

export const useClientDimensions = (
	ssrInitialize?: ClientDimensions
): ClientDimensions => {
	if (!ssrInitialize) requireNoSsr()

	const [windowDimensions, setWindowDimensions] = useState(
		() => ssrInitialize ?? getClientDimensions()
	)

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getClientDimensions())
		}

		handleResize()

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [setWindowDimensions])

	return windowDimensions
}
