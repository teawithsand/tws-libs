import { CommonTranslation, makeCommonTranslationTemplate } from "."

export const CommonTranslationPL_PL: CommonTranslation = {
	...makeCommonTranslationTemplate({
		languageName: "Polski",
		singlePartCode: "pl",
		twoPartCode: "pl-PL",

		language: "pl-PL",
	}),
	dialog: {
		areYouSure: {
			defaultCancelLabel: "Anuluj",
			defaultConfirmLabel: "Potwierdź",
			defaultMessage: "Czy na pewno chcesz to zrobić?",
			defaultTitle: "Potwierdź wybraną akcję",
			messageDelete: "Czy na pewno chcesz usunąć ten element?",
		},
	},
	form: {
		resetLabel: "Zresetuj",
		submitLabel: "Zatwierdź",
	},
}
