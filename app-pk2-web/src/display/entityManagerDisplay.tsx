import { useStickySubscribableSelector } from "@teawithsand/tws-stl-react"
import React, { useEffect, useMemo } from "react"

import { EntityContext } from "@app/game/entity/manager/defines"
import { Entity } from "@app/game/entity/manager/entity"
import { EntityManagerImpl } from "@app/game/entity/manager/manager"
import { runGameLoop } from "@app/game/loop"

const initEm = (em: EntityManagerImpl) => {
	class ExampleEntity extends Entity {
		protected innerInit(ctx: EntityContext): void {
			const hook = ctx.obtainReactRenderer(() => {
				const data = useStickySubscribableSelector(
					this.contextSubscribable,
					ctx => ({
						currentTickIndex: ctx.gameConfig.currentTickIndex,
						deltaTimeMs:
							ctx.gameConfig.lastUpdatePerformanceTimestamp -
							ctx.gameConfig.firstUpdatePerformanceTimestamp +
							1,
					}),
				)

				return (
					<text x={100} y={100}>
						TPS{" "}
						{Math.round(
							data.currentTickIndex / (data.deltaTimeMs / 1000),
						)}
					</text>
				)
			}, {})
			this.lcResRegistry.addDisplayHook(hook)
		}
	}

	em.addEntity(new ExampleEntity())
}

export const EntityManagerDisplay = () => {
	const em = useMemo(() => {
		const em = new EntityManagerImpl()
		initEm(em)
		return em
	}, [])

	useEffect(() => {
		const l = runGameLoop(
			async () => {
				em.doTick()
			},
			async () => {
				// unused. Rendering process happens via browser engine, no drawing logic is needed
				// in future sth like drawCanvases on EM could be used
				// but more reasonable solution would be to use something like react-konva in order to schedule diff+update layer onto external lib
				// but JIC this is function is here
				return
			},
			Math.round(1000 / 30), // ~30 FPS that is
		)

		return () => {
			l.break()
		}
	}, [em])

	const Renderer = em.renderer
	return (
		<>
			<Renderer />
		</>
	)
}
