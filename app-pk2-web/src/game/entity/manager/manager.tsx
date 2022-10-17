import { DefaultStickyEventBus } from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import React, { FC } from "react"

import {
	Entity,
	EntityContext,
	EntityManager,
} from "@app/game/entity/manager/defines"
import {
	GameReactRendererContext,
	ReactGameRendererHelper,
} from "@app/game/entity/manager/renderer"
import { GameState } from "@app/game/entity/manager/state"

export class EntityManagerImpl implements EntityManager {
	private svgHelper = new ReactGameRendererHelper()
	private entities: Map<string, Entity> = new Map()

	/**
	 * It's ok to access this context from outside.
	 * It may sometimes be useful when we want to have say some UI outside the entity model,
	 * which in case of web is easy and robust, unlike in DirectX/OpenGL C/C++ environment.
	 */
	public readonly ctx: EntityContext = (() => {
		const gameState = new DefaultStickyEventBus<GameState>({
			display: {
				height: 32 * 20,
				width: 32 * 40,
				screenOffsetX: 0,
				screenOffsetY: 0,
			},
		})
		return {
			gameState,
			manager: this,
			obtainReactRenderer: (component, props, options) => {
				const ctx =
					options.context ?? GameReactRendererContext.MAIN_SVG_SCREEN
				if (ctx !== GameReactRendererContext.MAIN_SVG_SCREEN) {
					throw new Error("non-svg renderers are NIY")
				}
				return this.svgHelper.obtainReactRenderer(component, props, {
					zIndex: options?.zIndex ?? undefined,
				})
			},
			updateGameState(state) {
				gameState.emitEvent(state(gameState.lastEvent))
			},
		}
	})()

	public readonly renderer: FC<{}> = () => {
		const display = useStickySubscribable(this.ctx.gameState).display
		const C = this.svgHelper.component

		return (
			<svg
				width={display.width}
				height={display.height}
				viewBox={`${display.screenOffsetX} ${display.screenOffsetY} ${
					display.width + display.screenOffsetX
				} ${display.height + display.screenOffsetY}`}
			>
				<C />
			</svg>
		)
	}

	addEntity(entity: Entity): void {
		entity.init(this.ctx)
		if (this.entities.has(entity.id))
			throw new Error("Entity with given id already added")
		this.entities.set(entity.id, entity)
	}

	getEntity(id: string): Entity | null {
		return this.entities.get(id) ?? null
	}

	// for now removing removed entities is ok
	removeEntity(id: string): void {
		const e = this.entities.get(id)
		if (e) e.release(this.ctx)
		this.entities.delete(id)
	}

	forEachEntity(it: (e: Entity) => void): void {
		this.entities.forEach(it)
	}

	findEntity(predicate: (e: Entity) => boolean): Entity | null {
		for (const v of this.entities.values()) {
			if (predicate(v)) return v
		}
		return null
	}

	doTick() {
		const rmSet = new Set<string>()
		for (const e of this.entities.values()) {
			const res = e.tick(this.ctx, 100) ?? {} // for now tick length is fixed

			const isDead = res.isDead ?? false
			if (isDead) rmSet.add(e.id)
		}

		for (const id of rmSet.values()) {
			this.removeEntity(id)
		}
	}
}
