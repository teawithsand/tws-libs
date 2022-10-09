import produce from "immer"

import {
	PaintElement,
	PaintElementType,
} from "@app/domain/paint/defines/element"
import { PaintSceneMutation } from "@app/domain/paint/defines/mutation"
import {
	applyMutationOnDraft,
	inverseMutation,
	MutationPaintScene,
} from "@app/domain/paint/defines/mutation/mutation"
import { PaintLayer } from "@app/domain/paint/defines/scene"

const predefinedInitialScene: MutationPaintScene = {
	layers: [],
}

const doMutationTest = (data: {
	initialScene?: MutationPaintScene | undefined
	targetScene: MutationPaintScene
	mutations: PaintSceneMutation[]
	disableNames?: boolean
}) => {
	let { initialScene, targetScene, disableNames } = data
	const { mutations } = data

	initialScene = initialScene ?? predefinedInitialScene
	disableNames = disableNames ?? true

	for (const m of mutations) {
		initialScene = produce(initialScene, draft =>
			applyMutationOnDraft(draft, m),
		)
	}

	initialScene = produce(initialScene, draft => {
		for (const l of draft.layers) {
			if (disableNames) l.options.name = ""
		}
	})

	targetScene = produce(targetScene, draft => {
		for (const l of draft.layers) {
			if (disableNames) l.options.name = ""
		}
	})

	expect(targetScene).toEqual(initialScene)
}

const doInverseTest = (data: {
	initialScene?: MutationPaintScene | undefined
	mutations: PaintSceneMutation[]
}) => {
	let { initialScene } = data
	const { mutations } = data

	const scenes: MutationPaintScene[] = []

	initialScene = initialScene ?? predefinedInitialScene

	let i = 0
	for (const m of mutations) {
		try {
			let scene
			if (i === 0) {
				scene = initialScene
			} else {
				scene = scenes[i - 1]
			}
			const newScene = produce(scene, draft =>
				applyMutationOnDraft(draft, m),
			)
			scenes.push(newScene)
		} finally {
			i++
		}
	}

	for (let i = scenes.length - 1; i >= 0; i--) {
		const mutatedScene = scenes[i]
		const m = mutations[i]

		let originalScene

		if (i === 0) {
			originalScene = initialScene
		} else {
			originalScene = scenes[i - 1]
		}

		const inv = inverseMutation(originalScene, m)
		const invertedScene = produce(mutatedScene, draft =>
			applyMutationOnDraft(draft, inv),
		)
		expect(originalScene).toEqual(invertedScene)
	}
}

// note: elements really only have to be different
// we do not really care about inner data
const element = (i: number): PaintElement => ({
	type: PaintElementType.HAND_DRAWN_PATH,

	points: [
		[i, i],
		[10, 10],
	],

	stroke: {
		color: [0, 0, 0],
		lineCap: "round",
		lineJoin: "round",
		size: 10,
	},
})

const makeLayer = (name: string, elements: PaintElement[]): PaintLayer => ({
	elements,
	options: {
		isVisible: true, // for sake of simplicity, this parameter won't be tested; it does not really matter for now
		isLocked: false,
		name,
	},
})

const noopLayer = (data: PaintLayer): PaintLayer => ({
	...data,
})

const scene = (layers: PaintLayer[]): MutationPaintScene => ({
	layers,
})

const srcScene4 = scene([
	noopLayer(makeLayer("l0", [element(0)])),
	noopLayer(makeLayer("l1", [element(1)])),
	noopLayer(makeLayer("l2", [element(2)])),
	noopLayer(makeLayer("l3", [element(3)])),
])

describe("PrimPaintScene", () => {
	describe("mutations", () => {
		it("can do push layer", () => {
			doMutationTest({
				initialScene: scene([]),
				targetScene: scene([
					noopLayer(makeLayer("added", [element(2), element(3)])),
				]),
				mutations: [
					{
						type: "push-layer",
						layer: makeLayer("added", [element(2), element(3)]),
					},
				],
			})
			doMutationTest({
				initialScene: scene([
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l1", [element(1)])),
				]),
				targetScene: scene([
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("added", [element(2), element(3)])),
				]),
				mutations: [
					{
						type: "push-layer",
						layer: makeLayer("added", [element(2), element(3)]),
					},
				],
			})

			doMutationTest({
				initialScene: scene([
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l1", [element(1)])),
				]),
				targetScene: scene([
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("added", [element(2), element(3)])),
					noopLayer(makeLayer("l1", [element(1)])),
				]),
				mutations: [
					{
						type: "push-layer",
						layer: makeLayer("added", [element(2), element(3)]),
						beforeLayerIndex: 1,
					},
				],
			})
		})

		it("can do drop layer", () => {
			const srcScene = srcScene4
			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l2", [element(2)])),
				]),
				mutations: [
					{
						type: "drop-layer",
					},
				],
			})

			for (let i = 0; i < srcScene.layers.length; i++) {
				doMutationTest({
					initialScene: srcScene,
					targetScene: scene(
						srcScene.layers.filter((v, j) => j !== i),
					),
					mutations: [
						{
							type: "drop-layer",
							layerIndex: i,
						},
					],
				})
			}
		})

		it("can do move", () => {
			const srcScene = scene([
				noopLayer(makeLayer("l0", [element(0)])),
				noopLayer(makeLayer("l1", [element(1)])),
				noopLayer(makeLayer("l2", [element(2)])),
				noopLayer(makeLayer("l3", [element(3)])),
			])

			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l2", [element(2)])),
					noopLayer(makeLayer("l3", [element(3)])),
					noopLayer(makeLayer("l0", [element(0)])),
				]),
				mutations: [
					{
						type: "move-layer",
						index: 0,
					},
				],
			})

			for (let i = 0; i < srcScene.layers.length; i++) {
				doMutationTest({
					initialScene: srcScene,
					targetScene: srcScene,
					mutations: [
						{
							type: "move-layer",
							index: i,
							beforeIndex: i,
						},
					],
				})
			}

			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l2", [element(2)])),
					noopLayer(makeLayer("l3", [element(3)])),
				]),
				mutations: [
					{
						type: "move-layer",
						index: 0,
						beforeIndex: 2,
					},
				],
			})

			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l2", [element(2)])),
					noopLayer(makeLayer("l3", [element(3)])),
					noopLayer(makeLayer("l0", [element(0)])),
				]),
				mutations: [
					{
						type: "move-layer",
						index: 0,
					},
				],
			})

			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l2", [element(2)])),
					noopLayer(makeLayer("l0", [element(0)])),
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l3", [element(3)])),
				]),
				mutations: [
					{
						type: "move-layer",
						index: 2,
						beforeIndex: 0,
					},
				],
			})

			doMutationTest({
				initialScene: srcScene,
				targetScene: scene([
					noopLayer(makeLayer("l1", [element(1)])),
					noopLayer(makeLayer("l2", [element(2)])),
					noopLayer(makeLayer("l3", [element(3)])),
					noopLayer(makeLayer("l0", [element(0)])),
				]),
				mutations: [
					{
						type: "move-layer",
						index: 0,
						beforeIndex: 4,
					},
				],
			})
		})

		it("can do drop layer elements", () => {
			let i = 0
			const initialScene = scene([
				noopLayer(
					makeLayer("l1", [
						element(i++),
						element(i++),
						element(i++),
						element(i++),
						element(i++),
						element(i++),
					]),
				),
			])

			doMutationTest({
				initialScene,
				targetScene: scene([noopLayer(makeLayer("l1", []))]),
				mutations: [
					{
						type: "drop-layer-elements",
						layerIndex: 0,
						toElementIndex: initialScene.layers[0].elements.length,
					},
				],
			})
			doMutationTest({
				initialScene,
				targetScene: scene([noopLayer(makeLayer("l1", []))]),
				mutations: [
					{
						type: "drop-layer-elements",
						layerIndex: 0,
						fromElementIndex: 0,
					},
				],
			})
			doMutationTest({
				initialScene,
				targetScene: scene([noopLayer(makeLayer("l1", []))]),
				mutations: [
					{
						type: "drop-layer-elements",
						layerIndex: 0,
					},
				],
			})
			doMutationTest({
				initialScene,
				targetScene: scene([noopLayer(makeLayer("l1", []))]),
				mutations: [
					{
						type: "drop-layer-elements",
						layerIndex: 0,
						fromElementIndex: 0,
						toElementIndex: initialScene.layers[0].elements.length,
					},
				],
			})
		})

		// TODO(teawithsand): more tests here for coverage
	})

	describe("inverse mutations", () => {
		it("can inverse push layer", () => {
			const srcScene = srcScene4
			doInverseTest({
				initialScene: srcScene,
				mutations: [
					{
						type: "push-layer",
						layer: makeLayer("pushed", [element(20)]),
					},
				],
			})

			for (let i = 0; i < srcScene.layers.length; i++) {
				doInverseTest({
					initialScene: srcScene,
					mutations: [
						{
							type: "push-layer",
							layer: makeLayer("pushed", [element(20)]),
							beforeLayerIndex: i,
						},
					],
				})
			}
		})

		it("can inverse drop layer", () => {
			const srcScene = srcScene4

			doInverseTest({
				initialScene: srcScene,
				mutations: [
					{
						type: "drop-layer",
					},
				],
			})

			for (let i = 0; i < srcScene.layers.length; i++) {
				doInverseTest({
					initialScene: srcScene,
					mutations: [
						{
							type: "drop-layer",
							layerIndex: i,
						},
					],
				})
			}
		})

		it("can inverse move layer", () => {
			const srcScene = srcScene4

			for (let i = 0; i < srcScene.layers.length; i++) {
				doInverseTest({
					initialScene: srcScene,
					mutations: [
						{
							type: "move-layer",
							index: i,
						},
					],
				})
			}

			for (let i = 0; i < srcScene.layers.length; i++) {
				for (let j = 0; j < srcScene.layers.length; j++) {
					doInverseTest({
						initialScene: srcScene,
						mutations: [
							{
								type: "move-layer",
								index: i,
								beforeIndex: j,
							},
						],
					})
				}
			}
		})

		it("can inverse push layer elements", () => {
			const srcScene = srcScene4

			doInverseTest({
				initialScene: srcScene,
				mutations: [
					{
						type: "push-layer-elements",
						layerIndex: 0,
						elements: [element(5), element(6)],
					},
				],
			})

			doInverseTest({
				initialScene: srcScene,
				mutations: [
					{
						type: "push-layer-elements",
						layerIndex: 0,
						elements: [],
					},
				],
			})
		})

		it("can inverse drop layer elements", () => {
			let i = 0
			const srcScene = scene([
				noopLayer(
					makeLayer("l0", [
						element(i++),
						element(i++),
						element(i++),
						element(i++),
						element(i++),
					]),
				),
			])

			const elements = [
				...Array(srcScene.layers[0].elements.length).keys(),
				undefined,
			]
			for (const i of elements) {
				for (const j of elements) {
					if (
						typeof i === "number" &&
						typeof j === "number" &&
						i > j
					) {
						continue
					}
					doInverseTest({
						initialScene: srcScene,
						mutations: [
							{
								type: "drop-layer-elements",
								layerIndex: 0,
								fromElementIndex: i,
								toElementIndex: j,
							},
						],
					})
				}
			}
		})

		it("can inverse move layer element", () => {
			let i = 0
			const srcScene = scene([
				noopLayer(
					makeLayer("l0", [
						element(i++),
						element(i++),
						element(i++),
						element(i++),
						element(i++),
					]),
				),
				noopLayer(
					makeLayer("l0", [
						element(i++),
						element(i++),
						element(i++),
						element(i++),
						element(i++),
					]),
				),
			])

			const elements = [
				...Array(srcScene.layers[0].elements.length).keys(),
			]

			// inter-layer move
			for (const i of elements) {
				for (const j of [...elements, undefined]) {
					if (typeof i === "number" && typeof j === "number") {
						continue
					}
					doInverseTest({
						initialScene: srcScene,
						mutations: [
							{
								type: "move-layer-element",
								sourceLayerIndex: 0,
								destinationLayerIndex: 1,
								sourceElementIndex: i,
								beforeDestinationElementIndex: j,
							},
						],
					})
				}
			}

			// same-layer move
			for (const i of elements) {
				for (const j of [...elements, undefined]) {
					if (typeof i === "number" && typeof j === "number") {
						continue
					}
					doInverseTest({
						initialScene: srcScene,
						mutations: [
							{
								type: "move-layer-element",
								sourceLayerIndex: 0,
								destinationLayerIndex: 0,
								sourceElementIndex: i,
								beforeDestinationElementIndex: j,
							},
						],
					})
				}
			}
		})
	})
})
