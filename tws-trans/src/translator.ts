import { throwExpression } from "@teawithsand/tws-stl"
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

export type TranslationObjectFactory<T extends TranslationObject, P> = (
	params: P
) => T

export class Translator<T extends TranslationObject, P> {
	constructor(
		private translations: Map<Language, TranslationObjectFactory<T, P>>,
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

	getTranslationForLanguage = (lang: Language | undefined, params: P): T => {
		let res = this.translations.get(lang ?? this.fallbackLanguage)
		if (!res) res = this.translations.get(this.fallbackLanguage)
		return (res || throwExpression(new Error(`Unreachable code`)))(params)
	}
}

/**
 * A context, which has translator generic over type T.
 */
export type TranslatorContext<T extends TranslationObject, P> = React.Context<
	Translator<T, P>
>

/**
 * Creates hooks, which operate on specified TranslatorContext, so it does not have to be provided
 * as parameter for each hook call.
 *
 * @see TranslatorContext
 * @see createTranslatorContext
 */
export const makeTranslationHooks = <T extends TranslationObject, P>(
	ctx: TranslatorContext<T, P>,
	paramsLoaderHook: () => P
) => ({
	useTranslator: (): Translator<T, P> => useContext(ctx),
	useTranslation: (): T => {
		const params = paramsLoaderHook()
		const lang = useLanguage()
		const translator = useTranslator(ctx)

		return translator.getTranslationForLanguage(lang, params)
	},
	useTranslationSelector: <E>(s: (obj: T) => E): E => {
		const params = paramsLoaderHook()

		const lang = useLanguage()
		const translator = useTranslator(ctx)

		return s(translator.getTranslationForLanguage(lang, params))
	},
})

/**
 * Creates react context for single specific translator.
 * You probably want to keep this context as global and never modify it's default value.
 *
 * @see makeTranslationHooks
 */
export const createTranslatorContext = <T extends TranslationObject, P>(
	translator: Translator<T, P>
): TranslatorContext<T, P> => {
	return createContext<Translator<T, P>>(translator)
}

export const useTranslator = <T extends TranslationObject, P>(
	ctx: TranslatorContext<T, P>
): Translator<T, P> => useContext(ctx)

export const useTranslation = <T extends TranslationObject, P>(
	ctx: TranslatorContext<T, P>,
	paramsLoaderHook: () => P
): T => {
	const params = paramsLoaderHook()
	const lang = useLanguage()
	const translator = useTranslator(ctx)

	return translator.getTranslationForLanguage(lang, params)
}

export const useTranslationSelector = <T extends TranslationObject, P, E>(
	ctx: TranslatorContext<T, P>,
	paramsLoaderHook: () => P,
	s: (obj: T) => E
): E => {
	const params = paramsLoaderHook()
	const lang = useLanguage()
	const translator = useTranslator(ctx)

	return s(translator.getTranslationForLanguage(lang, params))
}
