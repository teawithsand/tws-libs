import { graphql, useStaticQuery } from "gatsby"
import React, { useMemo } from "react"

import { MapData } from "@app/game/map"

const ArrayDisplay = (props: { tiles: number[][] }) => {
	const rawResources: Queries.ResourceFilesInnerQuery =
		useStaticQuery(graphql`
			query ResourceFilesInner {
				allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
					nodes {
						publicURL
						relativePath
					}
				}
			}
		`)
	const resMap: Map<number, string> = useMemo(() => {
		const m = new Map()

		for (let i = 0; i < 255; i++) {
			const res = rawResources.allFile.nodes.find(
				v =>
					v.relativePath ===
					`blocks/tiles01/${String(i).padStart(3, "0")}.png`,
			)

			if (res) {
				m.set(i, res.publicURL)
			}
		}

		return m
	}, [rawResources])

	const { tiles } = props
	return (
		<g>
			{tiles.flatMap((vv, i) =>
				vv.map((v, j) =>
					resMap.get(v) ? (
						<image
							key={`${i};${j}`}
							x={i * 32}
							y={j * 32}
							width={32}
							height={32}
							href={resMap.get(v)}
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
