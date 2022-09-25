import { createContext, useContext } from "react"
import { Language } from "./language"
import { useLanguage } from "./languageContext"

/**
 * Object, which is specified for each language.
 *
 * It can be anything, but most likely it's going to be some interface like AppTranslation, which
 * has multiple implementations for different languages.
 */
export type TranslationObject = {}

export class Translator<T extends TranslationObject> {
	constructor(
		private translations: Map<Language, T>,
		private fallbackLanguage: Language
	) {
		if (!translations.has(fallbackLanguage))
			throw new Error(
				`Fallback language "${fallbackLanguage}" not present in provided languages: ${[
					...translations.keys(),
				]
					.map((v) => `"${v}"`)
					.join(", ")}`
			)
	}

	getTranslationForLanguage = (lang?: Language): T => {
		const res = this.translations.get(lang ?? this.fallbackLanguage)
		if (!res) return this.translations.get(this.fallbackLanguage) as T
		return res
	}
}

/**
 * A context, which has translator generic over type T.
 */
export type TranslatorContext<T extends TranslationObject> = React.Context<
	Translator<T>
>

/**
 * Creates hooks, which operate on specified TranslatorContext, so it does not have to be provided
 * as parameter for each hook call.
 *
 * @see TranslatorContext
 * @see createTranslatorContext
 */
export const makeTranslationHooks = <T extends TranslationObject>(
	ctx: TranslatorContext<T>
) => ({
	useTranslator: (): Translator<T> => useContext(ctx),
	useTranslation: (): T => {
		const lang = useLanguage()
		const translator = useTranslator(ctx)

		return translator.getTranslationForLanguage(lang)
	},
	useTranslationSelector: <E>(s: (obj: T) => E): E => {
		const lang = useLanguage()
		const translator = useTranslator(ctx)

		return s(translator.getTranslationForLanguage(lang))
	},
})

/**
 * Creates react context for single specific translator.
 * You probably want to keep this context as global and never modify it's default value.
 *
 * @see makeTranslationHooks
 */
export const createTranslatorContext = <T extends TranslationObject>(
	translator: Translator<T>
): TranslatorContext<T> => {
	return createContext<Translator<T>>(translator)
}

export const useTranslator = <T extends TranslationObject>(
	ctx: TranslatorContext<T>
): Translator<T> => useContext(ctx)

export const useTranslation = <T extends TranslationObject>(
	ctx: TranslatorContext<T>
): T => {
	const lang = useLanguage()
	const translator = useTranslator(ctx)

	return translator.getTranslationForLanguage(lang)
}

export const useTranslationSelector = <T extends TranslationObject, E>(
	ctx: TranslatorContext<T>,
	s: (obj: T) => E
): E => {
	const lang = useLanguage()
	const translator = useTranslator(ctx)

	return s(translator.getTranslationForLanguage(lang))
}
