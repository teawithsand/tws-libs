import { Lock, LockAdapter, Unlock } from "@teawithsand/tws-stl"
import React, { ReactNode, useEffect, useState } from "react"

/**
 * Boundary, which claims lock given. Renders fallback if lock is NOT claimed.
 * Renders children once lock is claimed.
 */
export const LockBoundary = (props: {
	lock: Lock | LockAdapter
	fallback: ReactNode
	children?: ReactNode
}) => {
	const [isLocked, setIsLocked] = useState(false)

	useEffect(() => {
		const { promise, abort } = (
			props.lock instanceof Lock ? props.lock.adapter : props.lock
		).lockAbortable()

		let unlocker: Unlock | null = null
		;(async () => {
			setIsLocked(true)
			unlocker = await promise
		})()

		return () => {
			if (unlocker) {
				unlocker()
				unlocker = null
			}
			setIsLocked(false)
			abort() // just in case we didn't abort already
		}
	}, [setIsLocked, props.lock])

	if (!isLocked) return <>{props.fallback}</>
	return <>{props.children}</>
}
