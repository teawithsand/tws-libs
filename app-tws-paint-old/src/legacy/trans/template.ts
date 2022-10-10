import { TimestampMs } from "@teawithsand/tws-stl"
import { Language } from "@teawithsand/tws-trans"

export type TranslatableDate = Date | TimestampMs | string

export const translatableDateToDate = (date: TranslatableDate) => {
	if (date instanceof Date) return date
	return new Date(date)
}

/**
 * Predefined set of translations, which is commonly used so was migrated to tws-common.
 */
export interface CommonTranslation {
	// language in format like en-US or en-GB
	language: {
		/**
		 * @deprecated use new language instead and parse it if needed
		 */
		twoPartCode: string
		/**
		 * @deprecated use new language instead and parse it if needed
		 */
		singlePartCode: string
		/**
		 * Name of that language in given language. For instance "English".
		 */
		languageName: string

		language: Language
	}

	// Date only
	formatDate: (date: TranslatableDate) => string
	// Date + Time
	formatDateTime: (date: TranslatableDate) => string
	// Time only
	formatTime: (date: TranslatableDate) => string

	dialog: {
		areYouSure: {
			defaultTitle: string
			defaultMessage: string
			defaultConfirmLabel: string
			defaultCancelLabel: string

			messageDelete: string
		}
	}

	form: {
		submitLabel: string
		resetLabel: string
	}
}

export const makeCommonTranslationTemplate = (
	language: CommonTranslation["language"],
) => ({
	language,
	formatDate: (date: TranslatableDate) =>
		translatableDateToDate(date).toLocaleDateString(language.twoPartCode),
	formatDateTime: (date: TranslatableDate) =>
		translatableDateToDate(date).toLocaleString(language.twoPartCode),
	formatTime: (date: TranslatableDate) =>
		translatableDateToDate(date).toLocaleTimeString(language.twoPartCode),
})
