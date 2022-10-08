import React, { ReactNode } from "react"

import AppTranslation, {
	useAppTranslationSelector,
} from "@app/trans/AppTranslation"

import { ErrorExplainerBuilder } from "tws-common/misc/error-explainer"
import { claimId, NS_LOG_TAG } from "tws-common/misc/GlobalIDManager"
import { LOG } from "@teawithsand/tws-stl"

const LOG_TAG = claimId(NS_LOG_TAG, "wayside-shrines/app-error-explainer")

const TransSelector = (props: { trans: (s: AppTranslation) => string }) => {
	const text = useAppTranslationSelector(props.trans)
	return <>{text}</>
}

export const reactAppErrorExplainer = new ErrorExplainerBuilder<ReactNode>(
	e => {
		LOG.warn(LOG_TAG, "Got unexplained error", e)
		return <TransSelector trans={s => s.error.unknown} />
	},
).build()
