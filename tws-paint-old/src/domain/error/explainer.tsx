import { ErrorExplainerBuilder, LOG } from "@teawithsand/tws-stl"
import React, { ReactNode } from "react"

import {
	AppTranslation,
	useAppTranslationSelector,
} from "@app/trans/AppTranslation"

const LOG_TAG = "tws-paint-old/app-error-explainer"

const TransSelector = (props: { trans: (s: AppTranslation) => string }) => {
	const text = useAppTranslationSelector(props.trans)
	return <>{text}</>
}

export const reactAppErrorExplainer = new ErrorExplainerBuilder<ReactNode & {}>(
	e => {
		LOG.warn(LOG_TAG, "Got unexplained error", e)
		return <TransSelector trans={s => s.error.unknown} />
	},
).build()
