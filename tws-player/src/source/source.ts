import { throwExpression } from "@teawithsand/tws-stl"

/**
 * Simplest and the only(right now) PlayerSource claim.
 * It's simply claim of resource URL, which player may use.
 */
export interface PlayerSourceUrlClaim {
	readonly url: string

	close: () => Promise<void>
}

/**
 * Source, which first requires initialization, and then it may be simply disabled.
 */
export interface PlayerSource {
	/**
	 * Ask this source to prepare URL, which we can put into player.
	 */
	claimUrl: () => Promise<PlayerSourceUrlClaim>
}

/**
 * PlayerSource, which is simple static URL, say to remote source.
 */
export class UrlPlayerSource implements PlayerSource {
	constructor(public readonly url: string) {}
	claimUrl = async (): Promise<PlayerSourceUrlClaim> => {
		return Promise.resolve({
			url: this.url,
			close: async () => {},
		})
	}
}

/**
 * Defines types that may be returned from PlayerSourceLoadable.
 *
 * Blobs and Files use `URL.createObjectURL` to convert them into URLs.
 * Strings are considered URLs that require no freeing.
 * Anything else is interpreted as PlayerSourceUrlClaim, which is aromatically reference-counted,
 * so least resources is used.
 */
export type LoaderPlayerSourceLoadable =
	| Blob
	| File
	| string
	| PlayerSourceUrlClaim

export abstract class LoaderPlayerSource implements PlayerSource {
	abstract load: () => Promise<LoaderPlayerSourceLoadable>

	constructor() {}
	private innerClaim: PlayerSourceUrlClaim | null = null
	private counter = 0

	claimUrl = async (): Promise<PlayerSourceUrlClaim> => {
		if (this.counter === 0) {
			const res = await this.load()
			if (typeof res === "string") {
				this.innerClaim = {
					url: res,
					close: async () => {},
				}
			} else if (res instanceof Blob || res instanceof File) {
				const url = URL.createObjectURL(res)
				let isClosed = false
				this.innerClaim = {
					url,
					close: async () => {
						if (isClosed) return
						isClosed = true
						URL.revokeObjectURL(url)
					},
				}
			} else {
				this.innerClaim = res
			}
		}
		this.counter++

		let isClosed = false

		const claim =
			this.innerClaim ?? throwExpression(new Error("Unreachable code"))

		return Promise.resolve({
			url: claim.url,
			close: async () => {
				if (isClosed) return
				isClosed = true

				this.counter--
				if (this.counter === 0) {
					await claim.close()
					this.innerClaim = null
				}
			},
		})
	}
}

/**
 * PlayerSource, which uses some static asset as source.
 * It can be either, File(which inherits from blob), Blob or URL.
 */
export class StaticPlayerSource extends LoaderPlayerSource {
	constructor(public readonly asset: Blob | File | string) {
		super()
	}
	load = async (): Promise<LoaderPlayerSourceLoadable> => this.asset
}

/**
 * Source, which uses closures for source loading.
 * It's the most flexible one, but it does not support any kind of introspection.
 */
export class DynamicLoaderPlayerSource extends LoaderPlayerSource {
	constructor(
		private readonly loader: () => Promise<LoaderPlayerSourceLoadable>
	) {
		super()
	}
    
	load = async (): Promise<LoaderPlayerSourceLoadable> => await this.loader()
}
