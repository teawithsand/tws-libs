export class GatsbyResourcesUtil {
	constructor(public readonly res: Queries.ResourceFilesQuery) {}

	queryPathPrefix = (p: string): string[] => {
		return this.res.allFile.nodes
			.filter(r => r.relativePath.startsWith(p))
			.map(v => v.relativePath)
	}

	queryPath = (p: string): string =>
		this.res.allFile.nodes.find(r => r.relativePath === p)?.publicURL || ""

	queryPathSegments = (p: string[], extSwap: [string, string] = ["", ""]) =>
		this.queryPath(p.join("/").replace(extSwap[0], extSwap[1]))
}
