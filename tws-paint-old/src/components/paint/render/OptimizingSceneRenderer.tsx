import React, { useEffect, useState } from "react"

import { SceneRenderer } from "@app/components/paint/render/SceneRenderer"
import { useAsRef } from "@app/components/util/useAsRef"
import { PaintScene } from "@app/domain/paint/defines"

const InnerRenderer = <T extends SceneRenderer>(props: {
	scene: PaintScene
	renderer: T
	innerProps: Parameters<T>[0]
}) => {
	const { scene: currentScene, renderer: Renderer, innerProps } = props

	const currentSceneRef = useAsRef(currentScene)

	const [drawScene, setDrawScene] = useState<typeof currentScene>(
		() => currentScene,
	)

	useEffect(() => {
		const interval = setInterval(() => {
			setDrawScene(currentSceneRef.current)
		}, (1 / 30) * 1000)

		return () => {
			clearInterval(interval)
		}
	}, [])

	if (!Renderer) return <></>

	const AnyRenderer = Renderer as any

	return (
		<AnyRenderer
			{...{
				...innerProps,
				scene: drawScene,
			}}
		/>
	)
}

export const OptimizingSceneRenderer = InnerRenderer
