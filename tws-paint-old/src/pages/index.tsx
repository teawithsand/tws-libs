import React from "react"

import PageContainer from "@app/components/layout/PageContainer"
import { Paint } from "@app/components/paint/Paint"

import { wrapNoSSR } from "tws-common/react/components/NoSSR"

const IndexPage = () => {
	return (
		<PageContainer>
			<main>
				<Paint />
			</main>
		</PageContainer>
	)
}

export default wrapNoSSR(IndexPage)
