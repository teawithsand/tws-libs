import {
	DefaultStickyEventBus,
	getNowPerformanceTimestamp,
	PerformanceTimestampMs,
} from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import React, { FC } from "react"
import styled from "styled-components"

import { EntityContext, EntityManager } from "@app/game/entity/manager/defines"
import { Entity } from "@app/game/entity/manager/entity"
import {
	GameReactRendererContext,
	ReactGameRendererHelper,
} from "@app/game/entity/manager/renderer"
import { GameState } from "@app/game/entity/manager/state"
import { GameResources } from "@app/game/resources/gatsby"

const DisplayRoot = styled.div`
	display: grid;
	* {
		grid-row: 1;
		grid-column: 1;
	}
`

const HTMLDisplayRoot = styled.div`
	height: inherit;
	width: inherit;
	overflow: hidden;
`

const SVGDisplayRoot = styled.svg`
	border: 1px solid black;

	background-image: linear-gradient(45deg, #808080 25%, transparent 25%),
		linear-gradient(-45deg, #808080 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #808080 75%),
		linear-gradient(-45deg, transparent 75%, #808080 75%);
	background-size: 20px 20px;
	background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

	background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% /
		20px 20px;
`

export class EntityManagerImpl implements EntityManager {
	private svgHelper = new ReactGameRendererHelper()
	private htmlHelper = new ReactGameRendererHelper()
	private entities: Map<string, Entity> = new Map()

	constructor(private readonly resources: GameResources) {}

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
			gameConfig: {
				currentTickIndex: 0,
				firstUpdatePerformanceTimestamp: 0 as PerformanceTimestampMs,
				lastUpdatePerformanceTimestamp: 0 as PerformanceTimestampMs,
			},
			// TODO(teawithsand): consider removing these resources and replacing them with in-entity resources
			//  or use some buses in order to dynamically swap resources in entities, which in general
			//  is bad as we do not really want to replace stuff like mob AI decision trees OTF
			// IE. use constructor of entity
			resources: {
				currentMapResources: this.resources,
			},
			manager: this,
			spawn: entity => {
				if (this.entities.has(entity.id))
					throw new Error("Entity with given id already added")

				this.entities.set(entity.id, entity)
				entity.init(this.ctx)
			},
			obtainReactRenderer: (component, props, options) => {
				const ctx =
					options?.context ?? GameReactRendererContext.MAIN_SVG_SCREEN

				if (ctx === GameReactRendererContext.MAIN_SVG_SCREEN) {
					return this.svgHelper.obtainReactRenderer(
						component,
						props,
						{
							zIndex: options?.zIndex ?? undefined,
						},
					)
				} else if (ctx === GameReactRendererContext.MAIN_HTML_SCREEN) {
					return this.htmlHelper.obtainReactRenderer(
						component,
						props,
						{
							zIndex: options?.zIndex ?? undefined,
						},
					)
				} else {
					throw new Error(
						`Unexpected game react renderer context ${ctx}`,
					)
				}
			},
			updateGameState(state) {
				gameState.emitEvent(state(gameState.lastEvent))
			},
		}
	})()

	public readonly renderer: FC<{}> = () => {
		const display = useStickySubscribable(this.ctx.gameState).display
		const SVGComponent = this.svgHelper.component
		const HTMLComponent = this.htmlHelper.component

		return (
			<DisplayRoot
				style={{
					width: display.width + "px",
					height: display.height + "px",
				}}
			>
				<SVGDisplayRoot
					width={display.width}
					height={display.height}
					viewBox={`${display.screenOffsetX} ${display.screenOffsetY} ${display.width} ${display.height}`}
				>
					<SVGComponent />
				</SVGDisplayRoot>
				<HTMLDisplayRoot>
					{/*
						TODO(teawithsand): apply transforms here in order to emulate screen moving like svg does with viewBox
					*/}
					<HTMLComponent />
				</HTMLDisplayRoot>
			</DisplayRoot>
		)
	}

	addEntity = (entity: Entity): void => {
		if (this.entities.has(entity.id))
			throw new Error("Entity with given id already added")

		this.entities.set(entity.id, entity)
		entity.init(this.ctx)
	}

	getEntity = (id: string): Entity | null => {
		return this.entities.get(id) ?? null
	}

	// for now removing removed entities is ok
	removeEntity = (id: string): void => {
		const e = this.entities.get(id)
		if (e) e.release(this.ctx)
		this.entities.delete(id)
	}

	forEachEntity = (it: (e: Entity) => void): void => {
		this.entities.forEach(it)
	}

	findEntity = (predicate: (e: Entity) => boolean): Entity | null => {
		for (const v of this.entities.values()) {
			if (predicate(v)) return v
		}
		return null
	}

	release = () => {
		const keys = [...this.entities.keys()]
		for (const k of keys) {
			this.removeEntity(k)
		}
	}

	doTick = () => {
		const rmSet = new Set<string>()
		const entitiesCopy = [...this.entities.values()]
		for (const e of entitiesCopy) {
			const res = e.tick(this.ctx) ?? {} // for now tick length is fixed

			const isDead = res.isDead ?? false
			if (isDead) rmSet.add(e.id)
		}

		for (const id of rmSet.values()) {
			this.removeEntity(id)
		}

		this.ctx.gameConfig.currentTickIndex++
		const now = getNowPerformanceTimestamp()
		if (!this.ctx.gameConfig.firstUpdatePerformanceTimestamp)
			this.ctx.gameConfig.firstUpdatePerformanceTimestamp = now
		this.ctx.gameConfig.lastUpdatePerformanceTimestamp = now
	}
}
