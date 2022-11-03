import { useStickySubscribableSelector } from "@teawithsand/tws-stl-react"
import { graphql, useStaticQuery } from "gatsby"
import React, { useEffect, useMemo, useState } from "react"

import { throwExpression } from "@app/../../tws-stl/dist"
import { EntityManagerDisplay } from "@app/display/entityManagerDisplay"
import { EntityData, EntityDataDisposition } from "@app/game/data/entity"
import { PlayerEntity } from "@app/game/entity/impls/Player"
import { EntityContext } from "@app/game/entity/manager/defines"
import { Entity } from "@app/game/entity/manager/entity"
import { EntityManagerImpl } from "@app/game/entity/manager/manager"
import { GameResources, GatsbyResourceLoader } from "@app/game/resources/gatsby"
import { GatsbyResourcesUtil } from "@app/game/resources/managed"

class TPSEntity extends Entity {
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
					SUM TPS{" "}
					{Math.round(
						data.currentTickIndex / (data.deltaTimeMs / 1000),
					)}
				</text>
			)
		}, {})
		this.lcResRegistry.addDisplayHook(hook)
	}
}

const createEntityManager = (resources: GameResources) => {
	const em = new EntityManagerImpl(resources)
	em.addEntity(new TPSEntity())
	em.addEntity(
		new PlayerEntity(
			(
				resources.mapData.prePlacedEntities
					.flatMap(e => e)
					.find(e => e.entityData.name.match(/hedgehog/)) ??
				throwExpression(
					new Error("Can't find resource for player entity"),
				)
			).entityData as EntityData & {
				disposition: EntityDataDisposition.PLAYER
			},
		),
	)

	return em
}

const useGameResources = (): GameResources | null => {
	const data = useStaticQuery(graphql`
		query ResourceFiles {
			allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
				nodes {
					publicURL
					relativePath
				}
			}
		}
	`)
	const loader = useMemo(
		() => new GatsbyResourceLoader(new GatsbyResourcesUtil(data)),
		[data],
	)
	const [resources, setResources] = useState<GameResources | null>(null)
	useEffect(() => {
		let isValid = true
		;(async () => {
			const res = await loader.loadLegacyResources(
				"rooster island 1",
				"level001.map",
			)
			if (isValid) setResources(res)
		})()
		return () => {
			isValid = false
		}
	}, [loader])

	return resources
}

export const Game = () => {
	const resources = useGameResources()
	const em = useMemo(
		() => resources && createEntityManager(resources),
		[resources],
	)

	return <>{(em && <EntityManagerDisplay entityManager={em} />) || ""} </>
}
