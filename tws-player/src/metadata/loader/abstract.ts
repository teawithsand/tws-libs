import { Metadata } from "../metadata"
import { MetadataBag } from "../bag"
import { StickySubscribable } from "@teawithsand/tws-stl"

export interface MetadataLoader<S> {
	loadMetadata(src: S): Promise<Metadata>
}

export interface OptimisticMetadataLoader<S> {
	loadMetadata(src: S): Promise<Metadata | null>
}

export interface MetadataBagLoader<S> {
	loadMetadataBag(sources: S[]): {
		done: Promise<void>
		bag: StickySubscribable<MetadataBag>,
		cancel: (err: any) => void
	}
}
