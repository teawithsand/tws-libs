/**
 * Single audio filter, which may be applied
 */
export type AudioFilter =
	| {
			type: "gain"
			value: number
	  }
	| {
			type: "dynamic-compressor"

			threshold: number
			knee: number
			ratio: number
			attack: number
			release: number
	  }

export class WebAudioFilterManager {
	private audioContextData: {
		context: AudioContext
		sourceNode: MediaElementAudioSourceNode
	} | null = null

	private currentNodes: AudioNode[] = []
	private currentFilters: AudioFilter[] = []

	constructor(
		private readonly element:
			| HTMLAudioElement
			| HTMLVideoElement
			| HTMLMediaElement
	) {}

	private static get isSupported() {
		return "AudioContext" in window
	}

	private freeAudioContext = () => {
		this.applyFiltersInner([])

		if (!this.audioContextData) return
		this.audioContextData.sourceNode.disconnect()
		this.audioContextData.context.close().catch(() => {})
		this.audioContextData = null
	}

	close = () => {
		this.freeAudioContext()
	}

	private claimAudioContext = () => {
		if (!WebAudioFilterManager.isSupported) return
		if (this.audioContextData !== null) return

		const context = new window.AudioContext()
		this.audioContextData = {
			context,
			sourceNode: context.createMediaElementSource(this.element),
		}
	}

	applyFilters = (filters: AudioFilter[]) => {
		if (filters === this.currentFilters) return
		// Only claim audio context, once filters were changed.
		// Otherwise do not do it, as it(in general) should not be initialized eagerly.
		if (!this.audioContextData) this.claimAudioContext()

		this.applyFiltersInner(filters)
		this.currentFilters = filters
	}

	private applyFiltersInner = (filters: AudioFilter[]) => {
		if (!this.audioContextData) return
		const { sourceNode, context } = this.audioContextData
		for (const n of this.currentNodes) {
			n.disconnect(0)
		}
		this.currentNodes = []

		let node: AudioNode = sourceNode
		for (const f of filters) {
			if (f.type === "gain") {
				this.currentNodes.push(node)

				const n = context.createGain()
				n.gain.value = f.value

				node.connect(n)
				node = n
			} else if (f.type === "dynamic-compressor") {
				this.currentNodes.push(node)

				const n = context.createDynamicsCompressor()
				n.threshold.value = f.threshold
				n.attack.value = f.attack
				n.release.value = f.release
				n.knee.value = f.knee
				n.ratio.value = f.ratio

				node.connect(n)
				node = n
			}
			// ignore unknown filters
		}

		this.currentNodes.push(node)

		node.connect(context.destination)
	}
}
