import { graphql, useStaticQuery } from "gatsby"
import React, { useMemo } from "react"

import { MapData } from "@app/game/map"
import { GatsbyResourceLoader } from "@app/game/resources"

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
		() => new GatsbyResourceLoader(rawResources, "tiles01"),
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
							href={resLoader.foregroundBlockImageUrl(v)}
						/>
					) : undefined,
				),
			)}
		</g>
	)
}

export const StaticMapDisplay = (props: { map: MapData }) => {
	const { map } = props
	return (
		<svg
			style={{
				overflow: "visible",
			}}
			width={256 * 32}
			height={256 * 32}
		>
			<ArrayDisplay tiles={map.body.background} />
			<ArrayDisplay tiles={map.body.foreground} />
		</svg>
	)
}
