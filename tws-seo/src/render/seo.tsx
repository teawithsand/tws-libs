import { OGArticle, OGImage, OGProfile, SEO, SEOOpenGraph } from "../defines"
import { Link, LinkRenderer, Meta, MetaRenderer } from "./html"
import React from "react"

const renderProfile = (profile: OGProfile): Meta[] => {
	const res: Meta[] = []
	if (profile.firstName) {
		res.push({
			name: "profile:first_name",
			content: profile.firstName,
		})
	}
	if (profile.lastName) {
		res.push({
			name: "profile:last_name",
			content: profile.lastName,
		})
	}
	if (profile.username) {
		res.push({
			name: "profile:username",
			content: profile.username,
		})
	}

	if (profile.gender) {
		res.push({
			name: "profile:gender",
			content: profile.gender,
		})
	}
	return res
}

const renderArticle = (article: OGArticle): Meta[] => {
	let res: Meta[] = []
	const formatDate = (d: string | Date) => {
		if (d instanceof Date) return d.toISOString()
		return d
	}

	if (article.section)
		res.push({
			name: "article:section",
			content: article.section,
		})
	if (article.tags)
		res = [
			...res,
			...article.tags.flatMap((t) => ({
				name: "article:tag",
				content: t,
			})),
		]
	if (article.publishedTime)
		res.push({
			name: "article:published_time",
			content: formatDate(article.publishedTime),
		})
	if (article.lastModifiedTime)
		res.push({
			name: "article:modified_time",
			content: formatDate(article.lastModifiedTime),
		})
	if (article.expiresAfter)
		res.push({
			name: "article:expiration_time",
			content: formatDate(article.expiresAfter),
		})

	if (article.authors)
		res = [
			...res,
			...article.authors.flatMap((author): Meta[] =>
				renderProfile(author).map((m) => ({
					...m,
					name: "article:" + m.name,
				}))
			),
		]
	return res
}

const renderImage = (image: OGImage): Meta[] => {
	const res: Meta[] = []
	if (image.httpUrl) {
		res.push({
			name: "og:image",
			content: image.httpUrl,
		})
		res.push({
			name: "og:image:url",
			content: image.httpUrl,
		})
	}

	if (image.httpsUrl) {
		res.push({
			name: "og:image:secure",
			content: image.httpsUrl,
		})
		res.push({
			name: "og:image:secure_url",
			content: image.httpsUrl,
		})
	}

	if (image.httpsUrl) {
		res.push({
			name: "og:image:secure",
			content: image.httpsUrl,
		})
		res.push({
			name: "og:image:secure_url",
			content: image.httpsUrl,
		})
	}

	if (image.width) {
		res.push({
			name: "og:image:width",
			content: image.width.toString(),
		})
	}

	if (image.height) {
		res.push({
			name: "og:image:height",
			content: image.height.toString(),
		})
	}

	if (image.alt) {
		res.push({
			name: "og:image:alt",
			content: image.alt,
		})
	}

	return res
}

/**
 * Renders SEO data to CONTENTS of head element.
 * It DOES NOT RENDER head element itself.
 */
export const SEORender = (seo: SEO) => {
	const metas: Meta[] = []
	const links: Link[] = []

	if (seo.canonicalUrl) {
		links.push({
			rel: "canonical",
			href: seo.canonicalUrl,
		})
	}

	for (const al of seo.alternativeLanguages ?? []) {
		links.push({
			rel: "alternate",
			hreflang: al.lang,
			href: al.href,
		})
	}

	if (seo.description) {
		metas.push({
			name: "description",
			content: seo.description,
		})
	}

	if (seo.keywords) {
		metas.push({
			name: "keywords",
			content: seo.keywords.join(", "),
		})
	}

	if (seo.author) {
		metas.push({
			name: "author",
			content: seo.author,
		})
	}

	if (seo.openGraph) {
		const og = seo.openGraph

		const url = og.url ?? seo.canonicalUrl
		const title = og.title ?? seo.title
		const description = og.description ?? seo.description

		if (url)
			metas.push({
				name: "og:url",
				content: url,
			})
		if (title)
			metas.push({
				name: "og:title",
				content: title,
			})
		if (description)
			metas.push({
				name: "og:description",
				content: description,
			})

		if (og.siteName)
			metas.push({
				name: "og:site_name",
				content: og.siteName,
			})
		if (og.determiner)
			metas.push({
				name: "og:determiner",
				content: og.determiner,
			})
		if (og.locale)
			metas.push({
				name: "og:locale",
				content: og.locale,
			})

		for (const l of og.alternativeLocales ?? []) {
			metas.push({
				name: "og:locale:alternate",
				content: l,
			})
		}

		if (og.type)
			metas.push({
				name: "og:type",
				content: og.type,
			})

		if (og.type === "article" && og.article) {
			const article = og.article

			renderArticle(article).forEach((m) => metas.push(m))
		} else if (og.type === "profile" && og.profile) {
			const profile = og.profile
			renderProfile(profile).forEach((m) => metas.push(m))
		} else if (og.type === "website") {
			// empty for now
		}

		for (const i of og.images ?? []) {
			renderImage(i).forEach((m) => metas.push(m))
		}
	}

	if (seo.twitter) {
		const twitter = seo.twitter

		const title = twitter.title ?? seo.title
		const description = twitter.description ?? seo.description

		if (title)
			metas.push({
				name: "twitter:title",
				content: title,
			})

		if (description)
			metas.push({
				name: "twitter:description",
				content: description,
			})

		if (twitter.type)
			metas.push({
				name: "twitter:type",
				content: twitter.type,
			})

		if (twitter.creator)
			metas.push({
				name: "twitter:creator",
				content: twitter.creator,
			})
			
		if (twitter.site)
			metas.push({
				name: "twitter:site",
				content: twitter.site,
			})
	}

	return (
		<>
			{seo.title ? <title>{seo.title}</title> : null}

			<LinkRenderer links={links} />
			<MetaRenderer metas={metas} />
		</>
	)
}
