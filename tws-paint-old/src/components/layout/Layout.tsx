import { DialogBoundary } from "@teawithsand/tws-stl-react"
import { ProvideFixedLanguage } from "@teawithsand/tws-trans"
import React, { ReactElement, ReactFragment, ReactNode } from "react"
import { SSRProvider } from "react-bootstrap"
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			cacheTime: 0,
			suspense: true,
			useErrorBoundary: true,
			retry: false,
		},
		mutations: {
			useErrorBoundary: true,
		},
	},
})

const Layout = (props: {
	children: ReactElement | ReactNode | ReactFragment | null | undefined
}) => {
	return (
		<SSRProvider>
			<QueryClientProvider client={queryClient}>
				<ProvideFixedLanguage language="pl-PL">
					<DialogBoundary>{props.children}</DialogBoundary>
				</ProvideFixedLanguage>
			</QueryClientProvider>
		</SSRProvider>
	)
}

export default Layout
