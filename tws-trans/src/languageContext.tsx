import { throwExpression } from "@teawithsand/tws-stl"
import React, { createContext, ReactNode, useContext } from "react"
import { Language, usePreferredUserLanguage } from "./language"

export const LanguageContext = createContext<Language | null>(null)

/**
 * Useful when site should be dynamically translated, depending on 
 */
export const ProvidePreferredUserLanguage = (props: {
	children?: ReactNode
	fallback: Language,
	ssrFallback?: Language,
}) => {
	const lang = usePreferredUserLanguage(props.fallback, props.ssrFallback)

	return (
		<LanguageContext.Provider value={lang}>
			{props.children}
		</LanguageContext.Provider>
	)
}

/**
 * Useful when language is provided from external source(like URL) or user preferences.
 * 
 * If language is not provided, this provider does not provide it, which means
 * that parent-level provider works instead.
 */
export const ProvideFixedLanguage = (props: {
	children?: ReactNode,
	language?: Language
}) => {
	if (props.language) {
		return (
			<LanguageContext.Provider value={props.language}>
				{props.children}
			</LanguageContext.Provider>
		)
	} else {
		return <>
			{props.children}
		</>
	}
}

export const useLanguage = () =>
	useContext(LanguageContext) ??
	throwExpression(new Error("Language for useLanguage was not provided"))

export const useLanguageIfAny = () => useContext(LanguageContext)