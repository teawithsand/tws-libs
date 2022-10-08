import React, { ReactNode } from "react"
import { DefaultDialogContext, useProvideDialogManager } from "."

/**
 * Displays dialog before children components, if one was set.
 *
 * Internally uses useProvideDialogManager.
 *
 * It's useful when one wants to move where dialog is displayed for purpose of components like
 * ErrorWall or SimpleSuspend.
 */
export const DialogBoundary = (props: { children?: ReactNode }) => {
	const [dm, render] = useProvideDialogManager()

	return (
		<DefaultDialogContext.Provider value={dm}>
			{render ? render() : null}
			{props.children}
		</DefaultDialogContext.Provider>
	)
}
