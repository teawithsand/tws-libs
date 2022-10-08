import { configureStore } from "@reduxjs/toolkit"
import React, { forwardRef, useMemo, useState } from "react"
import { Helmet } from "react-helmet"
import { Provider } from "react-redux"
import styled from "styled-components"

import { BeforeUnloadHandler } from "@app/components/paint/handler/BeforeUnloadHandler"
import { EraseToolHandler } from "@app/components/paint/handler/EraseToolHandler"
import { MoveToolHandler } from "@app/components/paint/handler/MoveToolHandler"
import { PathToolHandler } from "@app/components/paint/handler/PathToolHandler"
import { ScrollSceneHandler } from "@app/components/paint/handler/ScrollSceneHandler"
import { SelectHandler } from "@app/components/paint/handler/SelectHandler"
import { UndoRedoHandler } from "@app/components/paint/handler/UndoRedoHandler"
import { ZoomHandler } from "@app/components/paint/handler/ZoomHandler"
import { ScreenPanelDisplay } from "@app/components/paint/panels/panel-display/ScreenPanelDisplay"
import { SidePanel } from "@app/components/paint/panels/side-panel/SidePanel"
import {
	sceneZIndex,
	selectionDisplayZIndex,
} from "@app/components/paint/pantZAxis"
import {
	ElementDisplayBoundingBoxContext,
	ElementDisplayBoundingBoxRegistryImpl,
} from "@app/components/paint/render/bbox"
import { SVGSceneRenderer } from "@app/components/paint/render/svg/SVGSceneRenderer"
import { SVGSelectionRenderer } from "@app/components/paint/selection/svg/SVGSelectionRenderer"
import { PaintActionType } from "@app/domain/paint/defines/action"
import {
	PaintEventType,
	PaintScreenEvent,
	PaintScreenEventType,
} from "@app/domain/paint/defines/event"
import {
	PaintEventBusProvider,
	usePaintEventBus,
} from "@app/domain/paint/event"
import {
	commitPaintActionAndResetUncommitted,
	paintStateReducer,
	resetPaintActionsStack,
} from "@app/domain/paint/redux"
import {
	usePaintCursor,
	usePaintScene,
	usePresentationDimensions,
} from "@app/domain/paint/redux/selector"

import useWindowDimensions from "tws-common/react/hook/dimensions/useWindowDimensions"

const InnerContainer = styled.div`
	display: grid;

	grid-template-columns: 100vw;
	grid-template-rows: 100vh;
	padding: 0;
	margin: 0;

	overflow: hidden;

	position: relative;

	& > * {
		grid-row: 1;
		grid-column: 1;
	}

	background-image: linear-gradient(45deg, #808080 25%, transparent 25%),
		linear-gradient(-45deg, #808080 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #808080 75%),
		linear-gradient(-45deg, transparent 75%, #808080 75%);
	background-size: 20px 20px;
	background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

	background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% /
		20px 20px;
`

// Trick not to emit cursor events while we are processing paint's stuff.
const EventContainer = styled.div`
	display: grid;

	grid-template-columns: 100vw;
	grid-template-rows: 100vh;
	padding: 0;
	margin: 0;

	overflow: hidden;

	& > * {
		grid-row: 1;
		grid-column: 1;
	}
`

const Renderer = styled(SVGSceneRenderer)`
	z-index: ${sceneZIndex};
`

// eslint-disable-next-line react/display-name
const InnerPaint = forwardRef((props: {}, ref) => {
	const bus = usePaintEventBus()
	const mustOnPaintScreenEvent = (e: PaintScreenEvent) => {
		bus.emitEvent({
			type: PaintEventType.SCREEN,
			screenEvent: e,
		})
	}

	const scene = usePaintScene()

	const { width, height, translateX, translateY } =
		usePresentationDimensions()

	const { height: screenHeight, width: screenWidth } = useWindowDimensions()

	const cursor = usePaintCursor()

	return (
		<InnerContainer>
			<ScreenPanelDisplay />
			<SidePanel />

			<EventContainer
				ref={ref as any}
				onPointerDown={e => {
					mustOnPaintScreenEvent({
						type: PaintScreenEventType.POINTER_DOWN,
						event: e.nativeEvent,
					})
				}}
				onPointerMove={e => {
					mustOnPaintScreenEvent({
						type: PaintScreenEventType.POINTER_MOVE,
						event: e.nativeEvent,
					})
				}}
				onPointerUp={e => {
					mustOnPaintScreenEvent({
						type: PaintScreenEventType.POINTER_UP,
						event: e.nativeEvent,
					})
				}}
			>
				<SVGSelectionRenderer
					style={{
						zIndex: selectionDisplayZIndex,
					}}
					screenWidth={screenWidth}
					screenHeight={screenHeight}
					scene={scene}
				/>

				<Renderer
					style={{
						cursor,
						transform: `translateX(${translateX}px) translateY(${translateY}px)`,
						zIndex: sceneZIndex,
					}}
					presentationWidth={width}
					presentationHeight={height}
					scene={scene}
				/>
			</EventContainer>
		</InnerContainer>
	)
})

export const Paint = () => {
	const store = useMemo(() => {
		const store = configureStore({
			reducer: paintStateReducer,
			middleware: getDefaultMiddleware =>
				getDefaultMiddleware({
					immutableCheck: false,
					serializableCheck: false,
				}),
		})

		store.dispatch(
			// Do kind of initial mutation
			// to ensure that layer zero is there
			commitPaintActionAndResetUncommitted({
				type: PaintActionType.SCENE_MUTATIONS,
				mutations: [
					{
						type: "push-layer",
						layer: {
							elements: [],
							options: {
								isLocked: false,
								isVisible: true,
								name: "Layer 0",
							},
						},
					},
				],
			}),
		)
		store.dispatch(
			// Do kind of initial mutation
			// to ensure that layer zero is there
			commitPaintActionAndResetUncommitted({
				type: PaintActionType.SET_SCENE_DIMENSIONS,
				dimensions: {
					height: 1000,
					width: 1000,
				},
			}),
		)

		store.dispatch(resetPaintActionsStack())

		return store
	}, [])

	const [sceneElement, setSceneElement] = useState<HTMLElement | null>(null)
	const boundingBoxProvider = useMemo(
		() => new ElementDisplayBoundingBoxRegistryImpl(),
		[],
	)

	return (
		<Provider store={store}>
			<PaintEventBusProvider>
				<ElementDisplayBoundingBoxContext.Provider
					value={boundingBoxProvider}
				>
					<Helmet>
						<meta
							name="viewport"
							content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover,shrink-to-fit=no"
						/>
					</Helmet>

					<SelectHandler />
					<BeforeUnloadHandler />
					<EraseToolHandler />
					{sceneElement ? (
						<ScrollSceneHandler sceneElement={sceneElement} />
					) : null}
					<MoveToolHandler />
					<PathToolHandler />
					<UndoRedoHandler />
					<ZoomHandler />
					<InnerPaint ref={setSceneElement} />
				</ElementDisplayBoundingBoxContext.Provider>
			</PaintEventBusProvider>
		</Provider>
	)
}
