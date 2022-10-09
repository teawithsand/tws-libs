import { getWindowDimensions } from "./window"
import { useEffect, useState } from "react"

// TODO(teawithsand): move breakpoint definitions and boundaries to enum

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl"

export const BREAKPOINT_XS: Breakpoint = "xs"
export const BREAKPOINT_SM: Breakpoint = "sm"
export const BREAKPOINT_MD: Breakpoint = "md"
export const BREAKPOINT_LG: Breakpoint = "lg"
export const BREAKPOINT_XL: Breakpoint = "xl"
export const BREAKPOINT_XXL: Breakpoint = "xxl"

export const breakpointMediaDown = (bp: Breakpoint) => {
	if (bp === "xxl") return ""
	return `(max-width: ${BREAKPOINT_BOUNDARIES[bp] - 0.02}px)`
}
export const breakpointMediaUp = (bp: Breakpoint) => {
	const boundaryBreakpointIndex = breakpointIndex(bp) - 1
	if (boundaryBreakpointIndex < 0) return ""
	const boundaryBreakpoint = BREAKPOINTS[boundaryBreakpointIndex]
	if (boundaryBreakpoint === "xxl") throw new Error("unreachable code")
	return `(min-width: ${BREAKPOINT_BOUNDARIES[boundaryBreakpoint]}px)`
}
export const breakpointMediaOnly = (bp: Breakpoint) => {
	const down = breakpointMediaUp(bp)
	let up = ""

	const nextBreakpoint = breakpointIndex(bp) + 1
	if (nextBreakpoint < BREAKPOINTS.length) {
		up = BREAKPOINTS[nextBreakpoint]
	}

	return (down + " " + up).trim()
}

export const BREAKPOINT_BOUNDARIES = {
	[BREAKPOINT_XS]: 576,
	[BREAKPOINT_SM]: 768,
	[BREAKPOINT_MD]: 992,
	[BREAKPOINT_LG]: 1200,
	[BREAKPOINT_XL]: 1400, // on newer bootstrap it's 1400 rather than 1444
	// above is breakpoint_XXL
}

export const BREAKPOINTS = [
	BREAKPOINT_XS,
	BREAKPOINT_SM,
	BREAKPOINT_MD,
	BREAKPOINT_LG,
	BREAKPOINT_XL,
	BREAKPOINT_XXL,
]

export const breakpointIndex = (breakpoint: Breakpoint): number =>
	BREAKPOINTS.indexOf(breakpoint)

// TODO(teawithsand): use this to refactor
const resolveBreakpointIndex = (width: number): number => {
	if (width < BREAKPOINT_BOUNDARIES[BREAKPOINT_XS]) {
		return 0
	} else if (
		width >= BREAKPOINT_BOUNDARIES[BREAKPOINT_XS] &&
		width < BREAKPOINT_BOUNDARIES[BREAKPOINT_SM]
	) {
		return 1
	} else if (
		width >= BREAKPOINT_BOUNDARIES[BREAKPOINT_SM] &&
		width < BREAKPOINT_BOUNDARIES[BREAKPOINT_MD]
	) {
		return 2
	} else if (
		width >= BREAKPOINT_BOUNDARIES[BREAKPOINT_MD] &&
		width < BREAKPOINT_BOUNDARIES[BREAKPOINT_LG]
	) {
		return 3
	} else if (
		width >= BREAKPOINT_BOUNDARIES[BREAKPOINT_LG] &&
		width < BREAKPOINT_BOUNDARIES[BREAKPOINT_XL]
	) {
		return 4
	} /* if (width >= 1440) */ else {
		return 5
	}
}

// Note: static SSR checks are required here
// 	since dynamic one does first render with isSSR = true, which causes
//  some hooks not to be registered(ones, which do not work on SSR)
//  and react does not like that
export const useBreakpoint = (
	onSSR: Breakpoint = BREAKPOINT_LG
): Breakpoint => {
	const index = useBreakpointIndex(
		onSSR ? BREAKPOINTS.indexOf(onSSR) : undefined
	)
	return BREAKPOINTS[index]
}

export const useBreakpointIndex = (
	onSSR: number = breakpointIndex(BREAKPOINT_LG)
): number => {
	const [measured, setMeasured] = useState(onSSR)

	useEffect(() => {
		function handleResize() {
			setMeasured(resolveBreakpointIndex(getWindowDimensions().width))
		}

		handleResize() // initialize after SSR defaults

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return measured
}
