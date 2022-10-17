import {
	DefaultStickyEventBus,
	generateUUID,
	StickyEventBus,
} from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import React, { FC, useMemo } from "react"

export type GameReactRendererHook<P> = {
	setProps(props: P): void
	release(): void
}

export enum GameReactRendererContext {
	MAIN_SVG_SCREEN = 1,
	MAIN_HTML_SCREEN = 2,
}

export type GameReactRendererOptions = {
	context?: GameReactRendererContext
	zIndex?: number // defaults to zero
}

type Renderer<P> = {
	key: string
	props: P
	component: FC<P>
}

export class ReactGameRendererHelper {
	private renderers: Array<Renderer<any>[] | undefined> = []
	private renderersBus: StickyEventBus<Array<Renderer<any>[] | undefined>> =
		new DefaultStickyEventBus(this.renderers)

	readonly component: FC<{}> = () => {
		const renderers = useStickySubscribable(this.renderersBus)
		const components = useMemo(() => {
			return renderers
				.flatMap(v => v ?? [])
				.map(v => {
					const C = v.component

					return <C {...v.props} key={v.key} />
				})
		}, [renderers])
		return <>{components}</>
	}

	private updateBus = () => {
		this.renderersBus.emitEvent([...this.renderers])
	}

	obtainReactRenderer<P>(
		component: FC<P>,
		props: P,
		options?: {
			zIndex?: number
		},
	): GameReactRendererHook<P> {
		const zIndex = (options?.zIndex ?? 0) + 1000 // there is no negative indexes in array,
		// also having this number big is not really bad, as JS has holey arrays

		const rendererObject: Renderer<P> = {
			component: component,
			props,
			key: generateUUID(),
		}

		if (zIndex >= this.renderers.length) {
			this.renderers.length = zIndex - 1 // this only grows array, so is ok
		}
		const targetArray = this.renderers[zIndex] ?? []
		const elementIndex = targetArray.push(rendererObject) - 1
		this.renderers[zIndex] = targetArray

		let released = false
		this.updateBus()

		return {
			release: () => {
				if (!released) {
					delete targetArray[elementIndex]
					released = true

					this.updateBus()
				}
			},
			setProps: newProps => {
				if (!released) {
					rendererObject.props = newProps

					this.updateBus()
				}
			},
		}
	}
}
