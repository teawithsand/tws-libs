import { Language, SimpleLanguage, simplifyLanguage } from "./language"

/**
 * Format, in which date translation component accepts date.
 */
export type TranslatableDate = string | number | Date

/**
 * Object containing some common useful utils for all translation languages.
 * Things like date formatting are included here.
 */
export interface CommonTranslation {
	language: Language
	simpleLanguage: SimpleLanguage

	formatDate: (date: TranslatableDate) => string
	formatTime: (date: TranslatableDate) => string
	/**
	 * @deprecated use formatDateTime instead
	 */
	formatDatetime: (date: TranslatableDate) => string
	formatDateTime: (date: TranslatableDate) => string
}

/**
 * Config, which can be loaded from tws-gatsby-plugin config makeExposeConfigGloballyPlugin.
 */
export interface CommonConfig {
	projectName: string
	siteUrl: string
	version: string
}

const makeDateObject = (date: string | number | Date): Date => {
	if (typeof date === "string" || typeof date === "number")
		date = new Date(date)
	return date
}

export const readCommonConfig = (prefix: string = ""): CommonConfig => {
	const object: CommonConfig = {
		// These have to be written like that, so webpack can understand these and replace with propper values
		projectName: process.env.projectName as string,
		siteUrl: process.env.siteUrl as string,
		version: (process.env.version ?? "0.0.1") as string,
	}
	return object
}

export const makeCommonTranslation = (
	language: Language,
	useBuiltinDateFormatters = false
): CommonTranslation => ({
	language,
	simpleLanguage: simplifyLanguage(language),

	formatDate: (date) =>
		useBuiltinDateFormatters
			? makeDateObject(date).toDateString()
			: makeDateObject(date).toLocaleDateString(language),
	formatTime: (date) =>
		useBuiltinDateFormatters
			? makeDateObject(date).toTimeString()
			: makeDateObject(date).toLocaleTimeString(language),
	formatDatetime: (date) =>
		useBuiltinDateFormatters
			? makeDateObject(date).toString()
			: makeDateObject(date).toLocaleString(language),
	formatDateTime: (date) =>
		useBuiltinDateFormatters
			? makeDateObject(date).toString()
			: makeDateObject(date).toLocaleString(language),
})
