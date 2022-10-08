import React, { ReactNode, Suspense } from "react"

import ErrorRenderer from "@app/components/layout/ErrorRenderer"
import { LoadingSpinner } from "@teawithsand/tws-stl-react"

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
