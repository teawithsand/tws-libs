export interface ResourceLoader {
	resolveResourceUrl(text: string): string
}

export type ResourceLoaderProvider = (res: string) => string | null

export class ResourceLoaderImpl implements ResourceLoader {
	constructor(private readonly providers: ResourceLoaderProvider[]) {}
    
	resolveResourceUrl(res: string): string {
		for (const p of this.providers) {
			const url = p(res)
			if (url) return url
		}

		throw new Error(`Filed to resolve resource ${res}`)
	}
}

// TODO(teawithsand): implement provider for these resources with gatsby plugin file system
//  and static query, which would load these resources
