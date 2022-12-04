import { graphql, useStaticQuery } from "gatsby"
import React from "react"

export const DumpResources = () => {
	const rawResources: Queries.ResourceFilesDumpQuery = useStaticQuery(graphql`
		query ResourceFilesDump {
			allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
				nodes {
					publicURL
					relativePath
				}
			}
		}
	`)

	return <>{JSON.stringify(rawResources)}</>
}
