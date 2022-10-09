import { ErrorBoundary, ErrorBoundaryProps } from "@teawithsand/tws-stl-react"
import React, { PropsWithChildren } from "react"
import { QueryErrorResetBoundary } from "react-query"

/**
 * Boundary, which merges QueryErrorResetBoundary and ErrorBoundary into single component.
 */
export const ComposedErrorBoundary = (
	props: PropsWithChildren<
		ErrorBoundaryProps & {
			onReset?: undefined
			onError?: undefined
		}
	>,
) => {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => <ErrorBoundary {...props} onReset={reset} />}
		</QueryErrorResetBoundary>
	)
}
