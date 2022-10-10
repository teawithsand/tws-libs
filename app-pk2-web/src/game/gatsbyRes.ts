import { graphql, useStaticQuery } from "gatsby"

export const rawResources: Queries.ResourceFilesQuery = useStaticQuery(graphql`
	query ResourceFiles {
		allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
			nodes {
				publicURL
				relativePath
			}
		}
	}
`)
