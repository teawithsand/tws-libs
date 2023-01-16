import { throwExpression } from "@teawithsand/tws-stl"
import React, {
	Context,
	createContext,
	ReactNode,
	useContext,
	useState,
} from "react"

export interface StateContextValue<T> {
	readonly value: T
	setValue: (value: T) => void
}

export type StateContext<T> = Context<StateContextValue<T> | null>

export const makeStateContext = <T,>(): StateContext<T> =>
	createContext<StateContextValue<T> | null>(null)

/**
 * Provides hook that simplifies useStateContext procedure.
 */
export const makeUseStateContextHook =
	<T,>(ctx: StateContext<T>): (() => [T, (v: T) => void]) =>
	() =>
		useStateContext<T>(ctx)

export const StateContextProvider = <T,>(props: {
	children?: ReactNode
	ctx: StateContext<T>
	initValue: T
}) => {
	const [value, setValue] = useState<T>(props.initValue)
	const { ctx: Context } = props

	return (
		<Context.Provider
			value={{
				setValue,
				value,
			}}
		>
			{props.children}
		</Context.Provider>
	)
}

export const useStateContext = <T,>(
	ctx: StateContext<T>
): [T, (value: T) => void] => {
	const { value, setValue } =
		useContext(ctx) ??
		throwExpression(
			new Error(`Can't use state context, as it was not provided`)
		)
	return [value, setValue]
}
