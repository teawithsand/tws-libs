import { OGArticle, OGImage, OGProfile } from "./og"
import { SEOTwitter } from "./twitter"

/**
 * For docs see: https://ogp.me/
 */
export type SEOOpenGraph = {
	images?: OGImage[] | undefined
	timeToLiveSeconds?: number | undefined

	determiner?: string | undefined

	/**
	 * This property(unless set to empty string) is automatically updated with description from SEO.
	 */
	description?: string | undefined

	/**
	 * Canonical URL of this page.
	 *
	 * This property(unless set to empty string) is automatically updated with canonicalUrl from SEO.
	 */
	url?: string | undefined

	/**
	 * It's NOT website title. It's more like website's name, which is unique across all pages.
	 * Think of whole web service name, not site name.
	 */
	siteName?: string | undefined

	/**
	 * Note: this property uses format like locale_TERRITORY like en_US.
	 * Notice underscore instead of dash and cAsE usage.
	 */
	alternativeLocales?: string[] | undefined

	/**
	 * Note: this property is in format locale_TERRITORY like en_US.
	 * Notice underscore instead of dash and cAsE usage.
	 */
	locale?: string | undefined

	/**
	 * This property(unless set to empty array) is automatically updated with title from SEO.
	 */
	title?: string | undefined
} & (
	| { type?: undefined }
	| {
			type: "website"
			// for now no specific props for webstie
	  }
	| {
			type: "article"
			article?: OGArticle
	  }
	| {
			type: "profile"
			profile?: OGProfile
	  }
)

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions for more info.
 */
export type AlternativeLanguagePage = {
	href: string
	lang: string // note: there is one special lang: x-default for fallback when user's device does not support any of provided languages
}

/**
 * The big SEO object, which defines all the seo properties, which may be rendered to <head> of html website.
 */
export type SEO = {
	/**
	 * For now ignored, as it should be set on HTML element, which is impossible in framework-independent way.
	 *
	 * In gatsby use gatsby-ssr or in future tws-gatsby-plugin.
	 * In react-helmet use parameter on <Helmet>.
	 */
	langauge?: string | undefined
	/**
	 * See https://developers.google.com/search/docs/specialty/international/localized-versions for more info.
	 */
	alternativeLanguages?: AlternativeLanguagePage[] | undefined
	title?: string | undefined
	description?: string | undefined
	author?: string
	keywords?: string[] | undefined
	canonicalUrl?: string | undefined

	twitter?: SEOTwitter | undefined
	openGraph?: SEOOpenGraph | undefined
}
