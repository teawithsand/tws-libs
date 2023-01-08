import { breakpointMediaDown, BREAKPOINT_MD } from "@teawithsand/tws-stl-react"
import { css } from "styled-components"

/**
 * A piece of styles, which makes markdown rendered by gatsby a little bit cleaner.
 *
 * It can be included using template string.
 */
export const gatsbyMarkdownWrapperStyles = css`
	& h1 {
		font-size: 2.3rem;
		font-weight: 400;

		// On small devices it's required to decrease font size
		@media ${breakpointMediaDown(BREAKPOINT_MD)} {
			font-size: 2rem;
		}
	}

	.gatsby-highlight pre[class*="language-"].line-numbers {
		padding: 0;
		padding-left: 2.8em;
		overflow: initial;
	}

	.gatsby-highlight {
		background: #f5f2f0;
		padding: 0.2rem 0.3rem;
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
		overflow: scroll;
	}

	& blockquote {
		background-color: rgba(0, 0, 0, 0.0625);
		padding: 0.3rem;
		border-radius: 0.3rem;
		border-left: 10px solid rgba(0, 0, 0, 0.125);

		font-style: italic;

		margin-bottom: 7px;
		margin-top: 7px;
		// margin-left: 10%;
		// margin-right: 10%;

		& p {
			display: inline;
			padding: 0;
			margin: 0;

			&::before {
				content: "\\201C";
				display: inline;
				touch-action: none;
				user-select: none;
			}

			&::after {
				content: "\\201D";
				display: inline;
				touch-action: none;
				user-select: none;
			}
		}
	}

	& figure.gatsby-resp-image-figure {
		overflow: hidden;
		& > span {
			overflow: hidden;
			max-height: max(80vh, 200px);

			& img {
				object-fit: contain;
			}
		}

		& figcaption.gatsby-resp-image-figcaption {
			padding-top: 0.3rem;
			text-align: center;

			color: rgba(0, 0, 0, 0.65);
			font-size: 1rem;
		}
	}
`

/**
 * Processes HTML of blog post to make it prettier and better in general.
 * For now it only fixes links to have noopener and noreferrer attributes.
 */
export const postProcessMarkdownHTML = (
	html: string,
	options?: {
		makeLinkNoOpenerNoReferrer: boolean
	},
): string => {
	const makeLinks = options?.makeLinkNoOpenerNoReferrer ?? true
	return makeLinks
		? html.replace(
				/<a(.*?)href="(.*?)"(.*?)>/gim,
				`<a $1 href="$2" rel="noopener noreferrer" $3>`,
		  )
		: html
}
