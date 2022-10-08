import React, { ReactFragment, ReactNode } from "react"

import { useAppTranslationSelector } from "@app/trans/AppTranslation"

import { Seo } from "tws-common/react/components/Seo"

const PageContainer = (props: { children?: ReactFragment | ReactNode }) => {
	const language = useAppTranslationSelector(s => s.common.language.language)
	const meta = useAppTranslationSelector(s => s.meta)
	return (
		<>
			<Seo
				title={meta.title}
				description={meta.description}
				language={language}
				type="website"
				websiteData={{}}
				siteName="Szlakiem Kapliczek"
				keywords={["kapliczki", "kapliczka", "krzyż"]}
			/>
			{props.children}
		</>
	)
}
export default PageContainer
