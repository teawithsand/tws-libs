import React from "react"

import ActualLayout from "./components/layout/Layout"

const Layout = props => {
	const { children } = props
	return <ActualLayout>{children}</ActualLayout>
}

export default Layout
