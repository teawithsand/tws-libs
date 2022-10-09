import { DialogBoundary, LoadingSpinner } from "@teawithsand/tws-stl-react"
import React, { ReactNode, Suspense } from "react"

import ErrorRenderer from "@app/components/layout/ErrorRenderer"
import { ComposedErrorBoundary } from "@app/legacy/ui/ComposedErrorBoundary"

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
