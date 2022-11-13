export type OGType = "website" | "article" | "profile" // There are more, but they are NIY. See https://ogp.me/#types for more info.

export type OGProfile = {
	firstName?: string | undefined
	lastName?: string | undefined
	username?: string | undefined

	/**
	 * According to https://ogp.me/#type_profile it's either male or female.
	 * It can't be helped I guess.
	 */
	gender?: "male" | "female" | undefined
}

export type OGImage = {
	httpUrl: string // must be absolute
	httpsUrl: string // must be absolute

	alt?: string
	width?: number
	height?: number
}

export type OGArticle = {
	/**
	 * In https://en.wikipedia.org/wiki/ISO_8601 format.
	 *
	 * Date object is preferred.
	 */
	publishedTime?: Date | string | undefined

	/**
	 * In https://en.wikipedia.org/wiki/ISO_8601 format.
	 *
	 * Date object is preferred.
	 */
	lastModifiedTime?: Date | string | undefined

	/**
	 * In https://en.wikipedia.org/wiki/ISO_8601 format.
	 *
	 * Date object is preferred.
	 */
	expiresAfter?: Date | string | undefined

	authors?: OGProfile[]
	section?: string

	/**
	 * If not set to empty array, this field is automatically filled with SEO keywords.
	 */
	tags?: string[]
}
