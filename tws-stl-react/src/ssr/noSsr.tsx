import React, { ReactNode } from "react"
import { useIsSsr } from "./isSsr"

/**
 * Wrapper component, which features `useIsSsr` in order to ensure that provided components won't
 * be rendered in SSR environment.
 *
 * @see useIsSsr
 */
export const NoSsr = (props: { children?: ReactNode }) => {
	const isSSR = useIsSsr()

	if (isSSR) {
		return <></>
	} else {
		return <>{props.children}</>
	}
}

/**
 * Note: does not work with ref={...} and React.forwardRef.
 *
 * Right now this works only for functional components.
 */
export const wrapNoSSR =
	<P,>(component: React.FC<P>): React.FC<P> =>
	// eslint-disable-next-line react/display-name
	(props: P) =>
		<NoSsr>{component(props)}</NoSsr>
