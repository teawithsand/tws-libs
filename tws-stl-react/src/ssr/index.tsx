const innerCanUseDom =
	typeof window !== "undefined" &&
	window.document &&
	window.navigator &&
	window.document.createElement

export const canUseDom = () => innerCanUseDom
/**
 * Returns true, whether react is used in SSR context.
 * 
 * DO NOT USE THIS IN REACT RENDER COMPONENTS!
 * Instead use `useIsSSR`
 * 
 * @see useIsSsr
 */
export const isSsr = () => !canUseDom()

/**
 * On first render, returns true ALWAYS.
 * On subsequent renders returns false if rendering is in browser.
 * This prevents react from being fooled by rendering inconsistencies between SSR and no-SSR.
 */
export const useIsSsr = () => {
	const [isServer, setIsServer] = useState(true)
	useEffect(() => {
		setIsServer(false)
	}, [])
	return isServer
}


/**
 * Throws, when using SSR.
 * Should be placed in front of methods, which do not work with SSR.
 */
export const requireNoSsr = () => {
	if (!canUseDom()) {
		throw new Error("This function does not work with SSR")
		// TODO(teawithsand): here we should have access to node APIs, so we can write file with note or sth
	}
}

import React, { ReactNode, useEffect, useState } from "react"

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