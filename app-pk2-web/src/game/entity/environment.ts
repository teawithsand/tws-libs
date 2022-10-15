import { FC } from "react"

import { GameState } from "@app/game/entity/state"

export enum GameReactRendererContext {
	MAIN_SVG_SCREEN = 1,
	MAIN_HTML_SCREEN = 2,
}

export type GameReactRendererOptions = {
	context?: GameReactRendererContext
	zIndex?: number // defaults to zero
}

export type GameReactRendererHook<P> = {
	setProps(props: P): void
	release(): void
}

export interface EntityEnvironment {
	gameState: GameState

	input: {
		keyUp: boolean
		keyDown: boolean
		keyLeft: boolean
		keyRight: boolean

		keySpace: boolean
		keyShift: boolean
		keyLeftControl: boolean
	}

	/**
	 * Obtains react-based renderer for this entity.
	 */
	obtainReactRenderer<P>(
		component: FC<P>,
		props: P,
		options?: GameReactRendererOptions,
	): GameReactRendererHook<P>
}
