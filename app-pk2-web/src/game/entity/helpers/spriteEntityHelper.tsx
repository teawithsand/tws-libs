import { DefaultStickyEventBus, throwExpression } from "@teawithsand/tws-stl"
import { useStickySubscribable } from "@teawithsand/tws-stl-react"
import React, { useEffect, useRef, useState } from "react"

import {
	EntityAnimationData,
	EntityAnimationDisposition,
} from "@app/game/data/entity"
import { EntityAnimationImageType } from "@app/game/data/entityAnimation"
import { EntityHooks } from "@app/game/entity/manager/entity"
import { GameReactRendererContext } from "@app/game/entity/manager/renderer"
import { Rect } from "@app/util/geometry"
import { ImageCutter } from "@app/util/imageCutter"

export class SpriteEntityHelper {
	private readonly bus = new DefaultStickyEventBus<{
		animations: Partial<EntityAnimationData>
		animationDisposition: EntityAnimationDisposition
		rect: Rect
	}>({
		animations: {},
		animationDisposition: EntityAnimationDisposition.IDLE,
		rect: new Rect([0, 0, 0, 0]),
	})

	// TODO(teawithsand): check performance of this stuff
	setEntityAnimationData = (data: EntityAnimationData) => {
		this.bus.emitEvent({
			...this.bus.lastEvent,
			animations: data,
		})
	}

	setAnimationDisposition = (
		animationDisposition: EntityAnimationDisposition,
	) => {
		this.bus.emitEvent({
			...this.bus.lastEvent,
			animationDisposition,
		})
	}

	setRect = (r: Rect) => {
		this.bus.emitEvent({
			...this.bus.lastEvent,
			rect: r,
		})
	}

	constructor(private readonly hooks: EntityHooks) {
		const ctx = this.hooks.contextSubscribable.lastEvent

		const displayHook = ctx.obtainReactRenderer(
			() => {
				const busData = useStickySubscribable(this.bus)

				if (!busData.rect.area) return <></>
				const animation =
					busData.animations[busData.animationDisposition]?.animation
				if (!animation) return <></>

				const cuttersMap = useRef(
					new Map<
						number,
						{
							cutter: ImageCutter
							rect: Rect | null
						}
					>(),
				)
				const [frameIndex, setFrameIndex] = useState(0)
				const frameIndexRef = useRef(0)
				const [cuttersMapLoaded, setCuttersMapLoaded] = useState(false)

				useEffect(() => {
					setCuttersMapLoaded(false)
					let isValid = true

					;(async () => {
						if (!isValid) return
						cuttersMap.current.clear()

						let i = 0
						for (const f of animation.frames) {
							if (!isValid) return

							cuttersMap.current.set(i++, {
								cutter: await ImageCutter.loadImage(f.url),
								rect:
									f.type ===
									EntityAnimationImageType.SUB_IMAGE
										? f.rect
										: null,
							})

							if (!isValid) return
							setCuttersMapLoaded(true)
						}
					})()

					return () => {
						isValid = false
					}
				}, [animation])

				useEffect(() => {
					frameIndexRef.current = 0

					const intervalHook = setInterval(() => {
						let nextFrame = frameIndexRef.current + 1

						if (animation.loop) {
							nextFrame = nextFrame % animation.frames.length
						} else {
							nextFrame = Math.min(
								nextFrame,
								animation.frames.length - 1,
							)
						}
						nextFrame = Math.max(nextFrame, 0)

						frameIndexRef.current = nextFrame
						setFrameIndex(nextFrame)
					}, 1000 / animation.frameRate) // how many times per second should this change, or per tick maybe?
					// + this should be limited to window.requestAnimationFrame and tick rate

					return () => {
						clearInterval(intervalHook)
					}
				}, [animation])

				const [canvas, setCanvas] = useState<HTMLCanvasElement>()
				const [ctx, setCtx] = useState<CanvasRenderingContext2D>()

				useEffect(() => {
					if (!canvas) return
					setCtx(
						canvas.getContext("2d") ??
							throwExpression("can't obtain 2d canvas context"),
					)
				}, [canvas])

				useEffect(() => {
					if (!ctx || !canvas) return

					const displayData = cuttersMap.current.get(frameIndex)
					if (cuttersMapLoaded && displayData) {

						displayData.cutter.drawFragment(
							ctx,
							canvas.width,
							canvas.height,
							displayData.rect ??
								new Rect([
									[0, 0],
									[
										displayData.cutter.width,
										displayData.cutter.height,
									],
								]),
						)
					}
				}, [
					ctx,
					canvas,
					frameIndex,
					cuttersMapLoaded,
					// these two are attached in order to force canvas redraw in such case,
					// even though they should not be strictly required. Sometimes canvas may scale instead of truncate, which is not
					// what we want and this fixes it
					busData.rect.width,
					busData.rect.height,
				])

				// TODO(teawithsand): optimize: do not render rect if it's out of scene as it does not make any sense

				return (
					<canvas
						ref={setCanvas as any} // FIXME: remove this any cast
						style={{
							transform: `translate(${busData.rect.p1.x}px, ${busData.rect.p1.y}px)`,
						}}
						height={busData.rect.height}
						width={busData.rect.width}
					/>
				)
			},
			{},
			{
				context: GameReactRendererContext.MAIN_HTML_SCREEN,
			},
		)
		this.hooks.lcResRegistry.addGeneric(() => {
			displayHook.release()
		})
	}
}
