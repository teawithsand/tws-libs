import React, { ReactNode, useCallback, useMemo, useState } from "react"
import { ConnectableElement, useDrag, useDrop } from "react-dnd"

export type SortableItemRenderProps<T> = {
	item: T
	index: number
	isDragging: boolean
	onRef: (element: ConnectableElement) => void
}
export type SortableItemRenderer<T> = React.FC<SortableItemRenderProps<T>>
export type ParentRenderer = React.FC<{
	onRef: (element: ConnectableElement) => void
	children: ReactNode
}>

type DropItem = {
	index: number
}

type ArrayOp =
	| {
			type: "move"
			index: number
			beforeIndex: number
	  }
	| {
			type: "noop"
	  }

const applyArrayOperation = <T,>(array: T[], op: ArrayOp): T[] => {
	if (op.type === "noop") {
		return array
	} else if (op.type === "move") {
		if (op.index === op.beforeIndex) return array
		const newArray = [...array]
		const elem = array[op.index]
		newArray.splice(op.index, 1)
		newArray.splice(op.beforeIndex, 0, elem)

		return newArray
	} else {
		throw new Error("unreachable code")
	}
}

const SortableChild = <T,>(props: {
	item: T
	index: number
	dragAndDropDataIdentifier: string

	render: SortableItemRenderer<T>

	setArrayOperation: (op: ArrayOp) => void
	// Unset currently set operation and performs commit on new one, which causes original data set to change
	commitAndUnsetArrayOperation: (op: ArrayOp | null) => void
}) => {
	const {
		item,
		index,
		dragAndDropDataIdentifier,
		render: Render,
		setArrayOperation,
		commitAndUnsetArrayOperation,
	} = props

	const dropItem: DropItem = useMemo(
		() => ({
			index,
		}),
		[index],
	)

	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: dragAndDropDataIdentifier,
			item: dropItem,
			collect: monitor => ({
				isDragging: monitor.isDragging(),
			}),
			end: (_item, monitor) => {
				const didDrop = monitor.didDrop()
				if (!didDrop) {
					setArrayOperation({
						type: "noop",
					})
				} else {
					commitAndUnsetArrayOperation(null)
				}
			},
		}),
		[
			dragAndDropDataIdentifier,
			dropItem,
			index,
			setArrayOperation,
			commitAndUnsetArrayOperation,
		],
	)

	const [, drop] = useDrop(
		() => ({
			accept: dragAndDropDataIdentifier,
			hover({ index: draggedIndex }: DropItem) {
				if (index !== draggedIndex) {
					setArrayOperation({
						type: "move",
						beforeIndex: index,
						index: draggedIndex,
					})
				}
			},
		}),
		[dragAndDropDataIdentifier, index, setArrayOperation],
	)

	return (
		<Render
			isDragging={isDragging}
			item={item}
			index={index}
			onRef={ref => {
				drop(drag(ref))
			}}
		/>
	)
}

// TODO(teawithsand): fix a bug which makes it impossible to drop dragged element onto place it was taken from
//  this can be fixed by introducing a phantom element, which is not rendered and is removed after drop had happened.
//  that element should replace element, which started dragging

const Sortable = <T,>(props: {
	dragAndDropDataIdentifier: string
	renderElement: SortableItemRenderer<T>
	renderParent: ParentRenderer
	elements: T[]
	onElementsChange: (newElements: T[]) => void
}) => {
	const {
		renderElement,
		renderParent: RenderParent,
		elements,
		onElementsChange,
		dragAndDropDataIdentifier,
	} = props

	const [arrayOp, setArrayOp] = useState<ArrayOp>({
		type: "noop",
	})

	const renderElements = useMemo(
		() =>
			applyArrayOperation(
				elements.map((e, i) => ({
					element: e,
					stableIndex: i,
				})),
				arrayOp,
			),
		[elements, arrayOp],
	)

	const [, drop] = useDrop(() => ({
		accept: dragAndDropDataIdentifier,
	}))

	// TODO(teawithsand): if it's too slow make it independent of arrayOp
	//  use react reference to do that
	const commitArrayOp = useCallback(
		(op: ArrayOp | null) => {
			const newElements = applyArrayOperation(elements, op ?? arrayOp)
			setArrayOp({ type: "noop" })
			onElementsChange(newElements)
		},
		[arrayOp, elements, setArrayOp, onElementsChange],
	)

	const setArrayOperation = useCallback(
		(op: ArrayOp) => {
			setArrayOp(op)
		},
		[setArrayOp],
	)

	// TODO(teawithsand): use keys better than indices
	return (
		<RenderParent onRef={drop}>
			{renderElements.map(({ element, stableIndex }) => {
				return (
					<SortableChild
						key={stableIndex}
						item={element}
						index={stableIndex}
						dragAndDropDataIdentifier={dragAndDropDataIdentifier}
						render={renderElement}
						commitAndUnsetArrayOperation={commitArrayOp}
						setArrayOperation={setArrayOperation}
					/>
				)
			})}
		</RenderParent>
	)
}

export default Sortable

/*
// Quick example: 
import React, { useState } from "react"
import styled from "styled-components"

import PageContainer from "@app/components/layout/PageContainer"

import Sortable from "tws-common/react/components/Sortable"

const Element = styled.li`
	padding: 0.8rem;
	border: 1px solid red;
	filter: ${({ $isDragging }) => ($isDragging ? "blur(5px)" : "none")};
`

const IndexPage = () => {
	const [elements, setElements] = useState([1, 2, 3, 4, 5])
	return (
		<PageContainer>
			<h1>Home page(NIY)</h1>
			<Sortable
				dragAndDropDataIdentifier="theOnlyDND"
				elements={elements}
				onElementsChange={setElements}
				render={({ item, onRef, isDragging: isDragging }) => (
					<Element ref={onRef} $isDragging={isDragging}>
						{item}
					</Element>
				)}
			/>
		</PageContainer>
	)
}

export default IndexPage
*/
