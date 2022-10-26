import {
	PerformanceTimestampMs,
	StickySubscribable,
} from "@teawithsand/tws-stl"
import { FC } from "react"

import { Entity } from "@app/game/entity/manager/entity"
import {
	GameReactRendererHook,
	GameReactRendererOptions,
} from "@app/game/entity/manager/renderer"
import { GameState } from "@app/game/entity/manager/state"

export interface EntityManager {
	addEntity(entity: Entity): void
	getEntity(id: string): Entity | null
	removeEntity(id: string): void

	forEachEntity(it: (e: Entity) => void): void

	/**
	 * As there are few entities, this should suffice.
	 * In future more advanced versions can be introduced.
	 */
	findEntity(predicate: (e: Entity) => boolean): Entity | null
}

export interface EntityContext {
	readonly manager: EntityManager
	readonly gameState: StickySubscribable<GameState>

	readonly gameConfig: {
		currentTickIndex: number
		lastUpdatePerformanceTimestamp: PerformanceTimestampMs
		firstUpdatePerformanceTimestamp: PerformanceTimestampMs
	}

	spawn(entity: Entity): void
	updateGameState(state: (state: GameState) => GameState): void
	obtainReactRenderer<P>(
		component: FC<P>,
		props: P,
		options?: GameReactRendererOptions,
	): GameReactRendererHook<P>
}
