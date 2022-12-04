import React from "react"
import { createGlobalStyle } from "styled-components"

import { Game } from "@app/display/gameComponent"

const Clear = createGlobalStyle`
body{
	padding: 0;
	margin: 0;
	height: 100vh;
	width: 100vw;
}`

const IndexPage = () => {
	// const map = useMemo(() => mapDataFromLegacy(parseLegacyMapData(mapOne)), [])
	return (
		<main>
			<Clear />
			{<Game />}
		</main>
	)
}

export default IndexPage
