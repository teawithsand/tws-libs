import { graphql, useStaticQuery } from "gatsby"

import { ExternalEntityData } from "../entity/data"
import { ResourceLoader } from "./res"

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

export class GatsbyResourceLoader implements ResourceLoader {
	backgroundColor?: string | undefined
	backgroundImageUrl?: string | undefined
	
	foregroundBlockImageUrl(id: number): string {
		throw new Error("Method not implemented.")
	}
	backgroundBlockImageUrl(id: number): string {
		throw new Error("Method not implemented.")
	}
	loadExternalEntityDataForName(name: string): ExternalEntityData {
		throw new Error("Method not implemented.")
	}
}
