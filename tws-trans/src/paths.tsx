import { Language } from "./language"
import { useLanguageIfAny } from "./languageContext"
import { useMemo } from "react"

export type PathEntry = string | ((...args: any[]) => string)

/**
 * Base type, which all Paths object should inherit from.
 */
export type Paths = {
	[key: string]: PathEntry
}

export type UseLanguagePrefixedPathsConfig = {
	defaultLanguage: Language
	allowedLanguages: Language[]
	language?: Language
}

/**
 * Prefixes provided paths object
 *
 * TODO(teawithsand): pass config parameters directly from tws-gatsby-plugin
 */
export const useLanguagePrefixedPaths = <T extends Paths>(
	paths: T,
	config: UseLanguagePrefixedPathsConfig
): T => {
	const loadedLanguage = useLanguageIfAny()
	const mustLanguage =
		config.language ?? loadedLanguage ?? config.defaultLanguage

	return useMemo(() => {
		if (
			config.allowedLanguages.includes(mustLanguage) &&
			mustLanguage !== config.defaultLanguage
		) {
			return prefixPaths(paths, mustLanguage.toLowerCase())
		}
		return paths
	}, [mustLanguage, config.defaultLanguage, config.allowedLanguages])
}

export const prefixPaths = <T extends Paths>(paths: T, prefix: string): T => {
	const joinPaths = (a: string, b: string) => {
		if (a.endsWith("/")) a = a.slice(0, -1)
		if (b.startsWith("/")) b = b.slice(1)
		if (!a.startsWith("/")) a = "/" + a
		return a + "/" + b
	}
	const res: T = {} as any

	for (const k in paths) {
		const entry = paths[k]
		if (typeof entry === "string") {
			;(res as any)[k] = joinPaths(prefix.toLowerCase(), entry)
		} else {
			;(res as any)[k] = (...args: any[]) =>
				joinPaths(prefix.toLowerCase(), entry(...args))
		}
	}

	return res
}
