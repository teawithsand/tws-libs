import React from "react"

export type Meta = {
	name: string
	content: string
}

/**
 * Simplified way to redner multiple meta headers.
 */
export const MetaRenderer = (props: { metas: Meta[] }) => {
	return (
		<>
			{props.metas.map((m, i) => {
				return <meta name={m.name} content={m.content} key={i} />
			})}
		</>
	)
}

export type Link = {
	rel: "next" | "prev" | "alternate" | "author" | "license"  | "canonical" // there are more but are NIY for now
	href: string
	type?: string
	hreflang?: string
}

/**
 * Simplified way to redner multiple meta headers.
 */
export const LinkRenderer = (props: { links: Link[] }) => {
	return (
		<>
			{props.links.map((m, i) => {
				return <link {...m} key={i} />
			})}
		</>
	)
}
