export type GameDisplay = {
	width: number
	height: number
	screenOffsetX: number
	screenOffsetY: number
}

/**
 * Global game state, shared among entities.
 * Such thing is useful.
 * For most states though, entities should be used instead.
 */
export type GameState = {
	display: GameDisplay
}
