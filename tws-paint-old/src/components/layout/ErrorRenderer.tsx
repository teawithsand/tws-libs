import React from "react"
import { Button } from "react-bootstrap"
import styled from "styled-components"

import { reactAppErrorExplainer } from "@app/domain/error/explainer"
import { ErrorBar } from "@app/legacy/ui/ErrorBar"

const ErrorParent = styled.div`
	display: grid;
	grid-auto-flow: row;
	grid-gap: 0.8rem;
	grid-template-columns: auto;
	grid-auto-rows: auto;
`

const ErrorRenderer = (props: {
	error: any
	resetErrorBoundary: () => void
}) => {
	const { error, resetErrorBoundary } = props

	return (
		<ErrorParent>
			<ErrorBar error={error} explainer={reactAppErrorExplainer} />
			<Button onClick={resetErrorBoundary}>Try again</Button>
		</ErrorParent>
	)
}

export default ErrorRenderer
