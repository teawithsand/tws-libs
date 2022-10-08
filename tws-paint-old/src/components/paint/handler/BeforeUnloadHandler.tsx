import React, { useEffect } from "react"

import { usePaintSelector } from "@app/domain/paint/redux/selector"

export const BeforeUnloadHandler = () => {
	const wasMutated = usePaintSelector(
		s => s.actionsState.wasSceneMutatedSinceLastSave,
	)

	useEffect(() => {
		const beforeUnload = (e: any) => {
			e.preventDefault()
			return (e.returnValue =
				"Any unsaved work may be lost. Make sure you've saved your drawing.")
		}
		if (wasMutated) {
			window.addEventListener("beforeunload", beforeUnload, {
				capture: true,
			})
			return () => {
				window.removeEventListener("beforeunload", beforeUnload, {
					capture: true,
				})
			}
		}
	}, [wasMutated])
	return <></>
}
