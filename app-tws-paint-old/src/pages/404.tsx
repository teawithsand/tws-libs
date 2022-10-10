import * as React from "react"
import { Link } from "gatsby"

import PageContainer from "@app/components/layout/PageContainer"
import { homePath } from "@app/paths"

// TODO(teawithsand): translate it
const NotFoundPage = () => {
	return (
		<main>
			<PageContainer>
				<h1>Page not found</h1>
				<Link to={homePath}>Go to home page</Link>.
			</PageContainer>
		</main>
	)
}

export default NotFoundPage
