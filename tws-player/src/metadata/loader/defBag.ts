import { DefaultStickyEventBus } from "@teawithsand/tws-stl"
import { MetadataBag } from "../bag"
import { MetadataLoadingResult, MetadataLoadingResultType } from "../metadata"
import { MetadataBagLoader, OptimisticMetadataLoader } from "./abstract"

export class DefaultMetadataBagLoader<S> implements MetadataBagLoader<S> {
	constructor(private readonly loaders: OptimisticMetadataLoader<S>[]) {}

	loadMetadataBag = (sources: S[]) => {
		const results: (MetadataLoadingResult | null)[] = new Array(
			sources.length
		).fill(null)
		const bagBus = new DefaultStickyEventBus(new MetadataBag(results))
		const loader = async () => {
			let i = 0
			for (const s of sources) {
				for (const l of this.loaders) {
					try {
						const res = await l.loadMetadata(s)
						if (res) {
							results[i] = {
								type: MetadataLoadingResultType.OK,
								metadata: res,
							}
							break
						}
					} catch (e) {
						results[i] = {
							type: MetadataLoadingResultType.ERROR,
							error: e,
						}
						break
					}
				}

				bagBus.emitEvent(new MetadataBag(results))

				i++
			}
		}
		return {
			done: loader(),
			bag: bagBus,
			cancel: () => {
				// TODO(teawithsand): implement canceling
				// NIY; noop for now
			},
		}
	}
}
