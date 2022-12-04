import { graphql, useStaticQuery } from "gatsby"
import React, { useMemo } from "react"

import { BlockMapData } from "@app/game/data/map"
import { GatsbyResourceLoader } from "@app/game/resources/gatsby"
import { GatsbyResourcesUtil } from "@app/game/resources/managed"

const ArrayDisplay = (props: { tiles: number[][] }) => {
	const rawResources: Queries.ResourceFilesQuery = useStaticQuery(graphql`
		query ResourceFiles {
			allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
				nodes {
					publicURL
					relativePath
				}
			}
		}
	`)

	const resLoader = useMemo(
		() => new GatsbyResourceLoader(new GatsbyResourcesUtil(rawResources)),
		[rawResources],
	)

	const { tiles } = props
	return (
		<g>
			{tiles.flatMap((vv, i) =>
				vv.map((v, j) =>
					v >= 0 && v <= 150 ? (
						<image
							key={`${i};${j}`}
							x={i * 32}
							y={j * 32}
							width={32}
							height={32}
							href={
								"todo resolve block url here, as we have to use specific tile set to handle it`"
							}
						/>
					) : undefined,
				),
			)}
		</g>
	)
}

export const StaticMapDisplay = (props: { map: BlockMapData }) => {
	const { map } = props
	return (
		<svg
			style={{
				overflow: "visible",
			}}
			width={256 * 32}
			height={256 * 32}
		>
			<ArrayDisplay tiles={map.backgroundBlocks} />
			<ArrayDisplay tiles={map.foregroundBlocks} />
		</svg>
	)
}
