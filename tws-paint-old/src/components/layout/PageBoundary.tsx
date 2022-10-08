import React, { ReactNode, Suspense } from "react"

import ErrorRenderer from "@app/components/layout/ErrorRenderer"

import { DialogBoundary } from "tws-common/react/components/dialog"
import { ComposedErrorBoundary } from "tws-common/react/components/error-boundary"
import LoadingSpinner from "tws-common/ui/LoadingSpinner"

const PageBoundary = (props: { children?: ReactNode }) => {
	const { children } = props

	return (
		<ComposedErrorBoundary FallbackComponent={ErrorRenderer}>
			<>
				<Suspense fallback={<LoadingSpinner />}>
					<>
						<DialogBoundary>{children}</DialogBoundary>
					</>
				</Suspense>
			</>
		</ComposedErrorBoundary>
	)
}

export default PageBoundary
