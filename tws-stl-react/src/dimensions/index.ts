
export type Orientation = "vertical" | "horizontal" | "square"
export type ScreenDimensions = {
	width: number
	height: number
	orientation: Orientation
}

export * from "./client"
export * from "./window"
export * from "./breakpoint"