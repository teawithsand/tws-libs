import React, { ReactFragment, ReactNode } from "react"

import { useAppTranslationSelector } from "@app/trans/AppTranslation"

const PageContainer = (props: { children?: ReactFragment | ReactNode }) => {
	const language = useAppTranslationSelector(s => s.common.language.language)
	const meta = useAppTranslationSelector(s => s.meta)
	return (
		<>
			{/* TODO(teawithsand): port seo stuff here */}
			{props.children}
		</>
	)
}
export default PageContainer
