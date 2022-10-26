import { graphql, useStaticQuery } from "gatsby"
import React from "react"

export const DumpResources = () => {
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

	return <>{JSON.stringify(rawResources)}</>
}
