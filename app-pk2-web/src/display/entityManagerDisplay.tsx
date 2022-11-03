import React, { useEffect } from "react"

import { EntityManagerImpl } from "@app/game/entity/manager/manager"
import { runGameLoop } from "@app/game/loop"

export const EntityManagerDisplay = (props: {
	entityManager: EntityManagerImpl // HACK: use entity manager here instead
}) => {
	const em = props.entityManager

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
			Math.round(1000 / 30), // ~30 TPS that is
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
