import AppTranslationEN_US from "@app/trans/AppTranslationEN_US"

import { CommonTranslation } from "tws-common/trans/common"
import { Language } from "tws-common/trans/language"
import Translator, {
	createTranslatorContext,
	makeTranslationHooks,
} from "tws-common/trans/Translator"

export default interface AppTranslation {
	common: CommonTranslation
	meta: {
		title: string
		description: string
		siteName: string
		siteKeywords: string[]
		siteAddress: string
	}
	error: {
		unknown: string
	}
	paint: {
		panel: {
			show: string
			hide: string
		}
	}
}

const translations = new Map<Language, AppTranslation>()

translations.set(
	AppTranslationEN_US.common.language.language,
	AppTranslationEN_US,
)

export const TranslatorContext = createTranslatorContext<AppTranslation>(
	new Translator(translations, "en-US"),
)

const hooks = makeTranslationHooks(TranslatorContext)

export const useAppTranslation = hooks.useTranslation
export const useAppTranslationSelector = hooks.useTranslationSelector
export const useTranslator = hooks.useTranslator
