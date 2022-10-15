import React, { FC, ReactNode } from "react"

import { Entity } from "@app/game/entity"
import {
	EntityEnvironment,
	GameReactRendererContext,
	GameReactRendererHook,
	GameReactRendererOptions,
} from "@app/game/entity/environment"
import { GameState, INITIAL_GAME_STATE } from "@app/game/entity/state"

type Renderer<P> = {
	props: P
	component: FC<P>
}

class EntityEnvironmentImpl implements EntityEnvironment {
	private renderers: {
		[key in GameReactRendererContext]: Array<Renderer<any>[] | undefined>
	} = {
		[GameReactRendererContext.MAIN_HTML_SCREEN]: [],
		[GameReactRendererContext.MAIN_SVG_SCREEN]: [],
	}

	constructor(public gameState: GameState) {}

	// TODO(teawithsand): add event bus, which contains finalized renderers for each context

	getRenderers = (ctx: GameReactRendererContext): Array<Renderer<any>> => {
		const filtered: Renderer<any>[] = this.renderers[ctx].filter(
			v => !!v,
		) as any as Renderer<any>[]

		return filtered.flatMap(v => v)
	}

	public readonly input: {
		keyUp: boolean
		keyDown: boolean
		keyLeft: boolean
		keyRight: boolean
		keySpace: boolean
		keyShift: boolean
		keyLeftControl: boolean
	} = {
		keyUp: false,
		keyDown: false,
		keyLeft: false,
		keyRight: false,
		keySpace: false,
		keyShift: false,
		keyLeftControl: false,
	}

	obtainReactRenderer<P>(
		component: React.FC<P>,
		props: P,
		options?: GameReactRendererOptions,
	): GameReactRendererHook<P> {
		const zIndex = (options?.zIndex ?? 0) + 1000 // there is no negative indexes in array
		const context =
			options?.context ?? GameReactRendererContext.MAIN_SVG_SCREEN

		const rendererObject: Renderer<P> = {
			component: component,
			props,
		}

		if (zIndex >= this.renderers[context].length) {
			this.renderers[context].length = zIndex - 1 // this only grows array, so is ok
		}

		const targetArray = this.renderers[context][zIndex] ?? []
		const elementIndex = targetArray.push(rendererObject) - 1
		this.renderers[context][zIndex] = targetArray

		let released = false

		return {
			release: () => {
				if (!released) {
					delete targetArray[elementIndex]
					released = true
				}
			},
			setProps: newProps => {
				if (!released) {
					rendererObject.props = newProps
				}
			},
		}
	}
}

export type GameDisplayOptions = {}

export class EntityManager {
	public readonly environment = new EntityEnvironmentImpl(INITIAL_GAME_STATE)

	constructor(private options: GameDisplayOptions) {}

	// TODO(teawithsand): use bus with these options and use bus hook
	setOptions = (options: GameDisplayOptions) => {
		this.options = options
	}

	registerEntity = (e: Entity) => {}

	readonly renderer: FC<{}> = () => {
		const renderers = this.environment.getRenderers(
			GameReactRendererContext.MAIN_SVG_SCREEN,
		)
		const displayList: ReactNode[] = []
		let i = 0

		for (const r of renderers) {
			const { component: Component, props: innerProps } = r

			displayList.push(<Component {...innerProps} key={i++} />)
		}
		displayList.reverse()

		return <svg>{displayList}</svg>
	}
}
