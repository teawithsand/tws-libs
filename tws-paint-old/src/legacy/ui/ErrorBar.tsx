import { ErrorExplainer } from "@teawithsand/tws-stl"
import React, { ReactNode, useMemo } from "react"
import { Alert } from "react-bootstrap"

/**
 * Simple error bar, which shows up only if error is truthy.
 * Uses error explainer to display error details if there is any error.
 */
export const ErrorBar = <T extends ReactNode>(props: {
	explainer: ErrorExplainer<T>
	error: any
}) => {
	const { explainer, error } = props

	const explained = useMemo(() => {
		if (error) {
			return explainer.explain(error)
		}
		return <></>
	}, [error])

	if (!error) {
		return <></>
	}

	return <Alert variant="danger">{explained}</Alert>
}
