import { Language, SimpleLanguage, simplifyLanguage } from "./language"

/**
 * Object containing some common useful utils for all translation languages.
 * Things like date formatting are included here.
 */
export interface CommonTranslation {
	language: Language
	simpleLanguage: SimpleLanguage

	formatDate: (date: string | number | Date) => string
	formatTime: (date: string | number | Date) => string
	formatDatetime: (date: string | number | Date) => string
}

const makeDateObject = (date: string | number | Date): Date => {
	if (typeof date === "string" || typeof date === "number")
		date = new Date(date)
	return date
}

export const makeCommonTranslation = (
	language: Language
): CommonTranslation => ({
	language,
	simpleLanguage: simplifyLanguage(language),

	formatDate: (date) => makeDateObject(date).toLocaleDateString(language),
	formatTime: (date) => makeDateObject(date).toLocaleTimeString(language),
	formatDatetime: (date) => makeDateObject(date).toLocaleString(language),
})
