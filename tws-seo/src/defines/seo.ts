import { OGArticle, OGImage, OGProfile } from "./og"
import { SEOTwitter } from "./twitter"

/**
 * For docs see: https://ogp.me/
 */
export type SEOOpenGraph =
	| {
			image?: OGImage
			timeToLiveSeconds?: number

			determiner?: string | undefined

			/**
			 * Canonical URL of this page.
			 *
			 * This property(unless set to empty string) is automatically updated with canonicalUrl from SEO.
			 */
			url?: string

			/**
			 * It's NOT website title. It's more like website's name, which is unique across all pages.
			 * Think of whole web service name, not site name.
			 */
			siteName?: string

			/**
			 * This property(unless set to empty array) is automatically updated with alternativeLaguages from SEO.
			 */
			alternativeLocales?: string[]
	  }
	| (
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
	keywords?: string[] | undefined
	canonicalUrl?: string | undefined

	twitter?: SEOTwitter | undefined
	openGraph?: SEOOpenGraph | undefined
}
