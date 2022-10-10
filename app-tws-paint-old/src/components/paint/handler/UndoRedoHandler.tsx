import React, { useEffect } from "react"
import { useDispatch } from "react-redux"

import { redoPaintActions, undoPaintActions } from "@app/domain/paint/redux"

export const UndoRedoHandler = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		const keyDownHandler = (e: KeyboardEvent) => {
			if ((e.ctrlKey && e.key === "Z") || e.key === "z") {
				e.preventDefault()
				if (e.shiftKey) {
					dispatch(redoPaintActions(1))
				} else {
					dispatch(undoPaintActions(1))
				}
			}
		}

		document.body.addEventListener("keydown", keyDownHandler, {
			passive: false,
		})

		return () => {
			document.body.removeEventListener("keydown", keyDownHandler)
		}
	}, [])

	return <></>
}
