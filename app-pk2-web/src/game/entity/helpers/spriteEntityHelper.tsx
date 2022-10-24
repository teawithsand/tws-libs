import { DefaultStickyEventBus } from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import React from "react"

import { EntityHooks } from "@app/game/entity/manager/entity"
import { Rect } from "@app/util/geometry"

export type SpriteEntityHelperData = {
	url: string // can be data url
	cropRect: Rect | null // rect to crop image at given url
}

export class SpriteEntityHelper {
	private readonly bus = new DefaultStickyEventBus({
		url: "",
		rect: new Rect(),
	})

    // TODO(teawithsand): check performance of this stuff
	setUrl = (url: string) => {
		this.bus.emitEvent({
			...this.bus.lastEvent,
			url,
		})
	}

	setRect = (r: Rect) => {
		this.bus.emitEvent({
			...this.bus.lastEvent,
			rect: r,
		})
	}

	constructor(private readonly hooks: EntityHooks) {
		this.hooks.lcSubscribable.addSubscriber(e => {
			if (e.type !== "init") return

			const displayHook = e.ctx.obtainReactRenderer(() => {
				const data = useStickySubscribable(this.bus)

				if (!data.rect.area) return <></>

				// TODO(teawithsand): implement cropRect parameter
                // It's quite hard to implement in SVG, as it turns out, so drawing to canvas and cropping should be
                // considered an option first
                // 
                // then handling bunch of object URLs should be easy
                // and releasing them afterwards should be no problem as well

				return (
					<image
						href={data.url}
						x={data.rect.p1.x}
						y={data.rect.p2.x}
						height={data.rect.height}
						width={data.rect.width}
					/>
				)
			}, {})

			this.hooks.lcResRegistry.addGeneric(() => {
				displayHook.release()
			})
		})
	}
}
