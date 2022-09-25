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
	private readonly context: AudioContext = new window.AudioContext()
	private readonly sourceNode: MediaElementAudioSourceNode

	private currentNodes: AudioNode[] = []

	constructor(
		element: HTMLAudioElement | HTMLVideoElement | HTMLMediaElement
	) {
		this.sourceNode = this.context.createMediaElementSource(element)
	}

	applyFilters = (filters: AudioFilter[]) => {
		for (const n of this.currentNodes) {
			n.disconnect(0)
		}
		this.currentNodes = []

		let node: AudioNode = this.sourceNode
		for (const f of filters) {
			if (f.type === "gain") {
				this.currentNodes.push(node)

				const n = this.context.createGain()
				n.gain.value = f.value

				node.connect(n)
				node = n
			} else if (f.type === "dynamic-compressor") {
				this.currentNodes.push(node)

				const n = this.context.createDynamicsCompressor()
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

		node.connect(this.context.destination)
	}
}
