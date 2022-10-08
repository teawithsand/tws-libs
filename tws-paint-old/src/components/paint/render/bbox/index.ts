import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { DefaultEventBus, Subscribable } from "tws-common/event-bus"
import { Rect, rectNormalize } from "tws-common/geometry"
import { throwExpression } from "tws-common/lang/throw"

export interface ElementDisplayBoundingBoxSubscribable
	extends Subscribable<Rect | null> {
	getBBox(): Rect | null
}

export interface ElementDisplayBoundingBoxRegistry {
	setBBoxObtainer: (
		layerIndex: number,
		elementIndex: number,
		obtainer: () => Rect | null,
	) => void
	unsetBBoxObtainer: (layerIndex: number, elementIndex: number) => void

	getBBox: (layerIndex: number, elementIndex: number) => Rect | null

	bBoxSubscribable: (
		layerIndex: number,
		elementIndex: number,
	) => ElementDisplayBoundingBoxSubscribable
}

type RectObtainerEvent = {
	layerIndex: number
	elementIndex: number
}

// TODO(teawithsand): implement some sexy dynamic tree or sth to get all elements, which fit/intersect given AABB.
export class ElementDisplayBoundingBoxRegistryImpl
	implements ElementDisplayBoundingBoxRegistry
{
	private readonly registry: Map<number, Map<number, () => Rect | null>> =
		new Map()

	private readonly innerBus = new DefaultEventBus<RectObtainerEvent>()

	setBBoxObtainer = (
		layerIndex: number,
		elementIndex: number,
		obtainer: () => Rect | null,
	) => {
		if (!this.registry.has(layerIndex)) {
			this.registry.set(layerIndex, new Map())
		}
		this.registry.get(layerIndex)?.set(elementIndex, obtainer)

		this.innerBus.emitEvent({
			elementIndex,
			layerIndex,
		})
	}

	unsetBBoxObtainer = (layerIndex: number, elementIndex: number) => {
		if (!this.registry.has(layerIndex)) {
			return
		}

		const res =
			this.registry.get(layerIndex) ??
			throwExpression(new Error("unreachable code"))
		res.delete(elementIndex)
		if (res.size === 0) {
			this.registry.delete(layerIndex)
		}

		this.innerBus.emitEvent({
			elementIndex,
			layerIndex,
		})
	}

	getBBox = (layerIndex: number, elementIndex: number): Rect | null => {
		const obtainer = this.registry.get(layerIndex)?.get(elementIndex)
		if (!obtainer) return null
		return obtainer()
	}

	bBoxSubscribable = (
		layerIndex: number,
		elementIndex: number,
	): ElementDisplayBoundingBoxSubscribable => {
		let lastRect: Rect | null = null

		return {
			getBBox: () => this.getBBox(layerIndex, elementIndex),
			addSubscriber: subscriber => {
				return this.innerBus.addSubscriber(e => {
					if (
						e.layerIndex === layerIndex &&
						e.elementIndex === elementIndex
					) {
						lastRect = this.getBBox(e.layerIndex, e.elementIndex)

						subscriber(lastRect)
					}
				})
			},
		}
	}
}

export const ElementDisplayBoundingBoxContext =
	createContext<ElementDisplayBoundingBoxRegistry | null>(null)

export const useElementDisplayBBoxRegistry = () => {
	const ctx = useContext(ElementDisplayBoundingBoxContext)
	if (!ctx)
		throw new Error(`ElementDisplayBoundingBoxRegistry is not provided`)
	return ctx
}

type ElementType = SVGPathElement | SVGTextElement | SVGImageElement

export const useBBoxObtainer = (): [
	(elem: ElementType | null | undefined) => void,
	() => Rect | null,
] => {
	const [ref, setRef] = useState<ElementType | null>(null)

	return [
		arg => {
			setRef(arg ?? null)
		},
		() => {
			if (ref) {
				const box = ref.getBBox()
				return rectNormalize([
					[box.x, box.y],
					[box.x + box.width, box.y + box.height],
				])
			}
			return null
		},
	]
}

export const useRegisterInBBoxRegistry = (
	layerIndex: number,
	elementIndex: number,
	args?: any[],
) => {
	const reg = useElementDisplayBBoxRegistry()
	const [ref, obtainer] = useBBoxObtainer()

	const box = useMemo(() => {
		return obtainer()
	}, [ref, layerIndex, elementIndex, ...(args ?? [])])

	useEffect(() => {
		reg.setBBoxObtainer(layerIndex, elementIndex, () => box)

		return () => {
			reg.unsetBBoxObtainer(layerIndex, elementIndex)
		}
	}, [reg, box, layerIndex, elementIndex])

	return ref
}
