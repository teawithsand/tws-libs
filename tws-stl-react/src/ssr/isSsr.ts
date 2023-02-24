import { useEffect, useState } from "react"

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
 * @deprecated useIsSsr unsafe
 */
export const isSsr = () => !canUseDom()

/**
 * Returns true, whether react is used in SSR context.
 * 
 * DO NOT USE THIS IN REACT RENDER COMPONENTS!
 * Instead use `useIsSSR`.
 * 
 * @see useIsSsr
 */
export const isSsrUnsafe = () => !canUseDom()

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