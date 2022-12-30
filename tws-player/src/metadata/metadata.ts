import { Milliseconds } from "../unit"

export type ID3Metadata = {
	title: string | null
	artist: string | null
	album: string | null
	year: number | null
}

export type Metadata = {
	duration: Milliseconds | null
} & ID3Metadata

export enum MetadataLoadingResultType {
	OK = 1,
	ERROR = 2,
}

export type MetadataLoadingResult =
	| {
			type: MetadataLoadingResultType.OK
			metadata: Metadata
	  }
	| {
			type: MetadataLoadingResultType.ERROR
			error: any
	  }
