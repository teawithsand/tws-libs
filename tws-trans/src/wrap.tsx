import { throwExpression } from "@teawithsand/tws-stl"
import React, { useMemo } from "react"
import { Language, recoverLanguageFromString } from "./language"
import { ProvideFixedLanguage } from "./languageContext"

/**
 * Wraps gatsby page component in fixed language provider in order to push page language to lower level components.
 * 
 * It expect language to be part of page context.
 */
export const wrapGatsbyPage = <
	T extends JSX.IntrinsicAttributes & {
		pageContext: {
			language: Language
		}
	}
>(
	Component: React.FC<T>,
	options?: {
		fallback?: Language
		mandatory?: boolean // defaults to true. Ignored when fallback is set
	}
) => {
	// eslint-disable-next-line react/display-name
	return (props: T) => {
		const { pageContext: pageContext } = props
		const { fallback, mandatory = true } = options ?? {}

		if (!mandatory && !fallback && !pageContext.language)
			return (
				<>
					<Component {...props} />
				</>
			)

		const recoveredLanguage = useMemo(
			() =>
				recoverLanguageFromString(
					pageContext.language ??
						fallback ??
						throwExpression(
							new Error(
								`Language was not provided. Received following pageContext: ${JSON.stringify(
									pageContext
								)}`
							)
						)
				) ??
				throwExpression(
					new Error(
						`Unknown language provided: ${pageContext.language}`
					)
				),
			[pageContext.language]
		)

		return (
			<ProvideFixedLanguage language={recoveredLanguage}>
				<Component {...props} />
			</ProvideFixedLanguage>
		)
	}
}
