import { Metadata } from "../metadata"
import { MetadataBag } from "../bag"
import { StickySubscribable } from "@teawithsand/tws-stl"
import { PlayerSource } from "../../source"

export interface MetadataLoader {
	loadMetadata(src: PlayerSource): Promise<Metadata>
}

export interface OptimisticMetadataLoader {
	loadMetadata(src: PlayerSource): Promise<Metadata | null>
}

export interface MetadataBagLoader {
	loadMetadataBag(sources: PlayerSource[]): {
		done: Promise<void>
		bag: StickySubscribable<MetadataBag>
		cancel: (err: any) => void
	}
}
