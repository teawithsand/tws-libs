import { latePromise } from "@teawithsand/tws-stl"
import { Context, createContext, ReactNode, useContext, useState } from "react"

export * from "./boundary"

export type DialogRenderProps<T> = {
	show: boolean
	resolve: (data: T) => void
	reject: (e: any) => void
}

export type DialogRender<T> = (renderProps: DialogRenderProps<T>) => ReactNode

export type ShowDialogOptions = {
	hideTimeout: number
}

export type DialogManager = {
	showDialog<T>(
		render: DialogRender<T>,
		options?: ShowDialogOptions,
	): Promise<T>
}

export type DialogManagerContext = Context<DialogManager>

export const DefaultDialogContext = createContext(
	// obviously it's not correct. It's user responsibility to supply DM
	// but it makes TS happy
	null as unknown as DialogManager,
)

export const useDialogManager = (
	ctx: DialogManagerContext = DefaultDialogContext,
): DialogManager => {
	const v = useContext(ctx)
	if (!v) throw new Error("DialogManager was not supplied for given context")
	return v
}

export const useProvideDialogManager = (): [
	DialogManager,
	(() => ReactNode) | null,
] => {
	const [finalRenderStack, setFinalRenderStack] = useState<
		(() => ReactNode)[]
	>([])

	// TODO(teawithsand): make this more bugproof by making innerRender's parameters static with help of useRef
	//  since now using outdated functions will cause wild and hard to find bugs
	return [
		{
			showDialog: <T>(innerRender: DialogRender<T>) => {
				const [promise, resolve, reject] = latePromise<T>()

				let resolved = false

				setFinalRenderStack([
					...finalRenderStack,
					() =>
						innerRender({
							show: true,
							reject: e => {
								if (!resolved) {
									// displayed one (AKA the one, which can be resolved is always first one)
									const newStack = [...finalRenderStack]
									newStack.shift()

									resolved = true
									setFinalRenderStack(newStack)
									reject(e)
								}
							},
							resolve: (data: T) => {
								if (!resolved) {
									// displayed one (AKA the one, which can be resolved is always first one)
									const newStack = [...finalRenderStack]
									newStack.shift()

									resolved = true
									setFinalRenderStack(newStack)
									resolve(data)
								}
							},
						}),
				])

				return promise
			},
		},
		finalRenderStack.length > 0 ? finalRenderStack[0] : null,
	]
}
