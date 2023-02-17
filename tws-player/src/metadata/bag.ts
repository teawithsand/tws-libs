import { isTimeNumber } from "../util"
import { Metadata, MetadataLoadingResultType } from "./metadata"
import { MetadataLoadingResult } from "./metadata"

/**
 * Bag, which contains multiple MetadataLoadingResults, and is able to compute some info from it,
 * and in general provides prettier api for making queries to it.
 */
export class MetadataBag {
	private sumDurationToIndex: number[] = []
	private readonly innerResults: (MetadataLoadingResult | null)[] = []
	private readonly innerIsDone: boolean

	constructor(
		results:
			| (MetadataLoadingResult | null)[]
			| Map<number, MetadataLoadingResult>
	) {
		if (results instanceof Map) {
			const arr = new Array(results.size)
			arr.fill(null)
			for (const [k, v] of results.entries()) {
				arr[k] = v
			}

			results = arr
		}

		this.innerResults = [...results]

		this.innerIsDone = this.innerResults.every((r) => r !== null)

		this.sumDurationToIndex = []
		let sum: number | null = 0
		for (const entry of results) {
			this.sumDurationToIndex.push(sum ?? -1)

			if (entry && entry.type === MetadataLoadingResultType.OK) {
				const { metadata } = entry

				if (typeof sum === "number") {
					if (
						(typeof metadata.duration === "number" ||
							typeof metadata.duration === "bigint") &&
						isFinite(metadata.duration) &&
						metadata.duration >= 0
					) {
						sum += metadata.duration
					} else {
						sum = null
					}
				}
			} else {
				sum = null
			}
		}
	}

	get length() {
		return this.innerResults.length
	}

	get results() {
		// create copy, so we surely won't mutate bag.
		return [...this.innerResults]
	}

	getResult = (i: number): MetadataLoadingResult | null => {
		if (i >= this.innerResults.length) return null
		return this.innerResults[i]
	}

	getSuccessOrNull = (i: number): Metadata | null => {
		const r = this.getResult(i)
		if (!r || r.type !== MetadataLoadingResultType.OK) return null
		return r.metadata
	}

	getDurationOrNull = (i: number): number | null => {
		const r = this.getResult(i)
		if (
			!r ||
			r.type !== MetadataLoadingResultType.OK ||
			!isTimeNumber(r.metadata.duration)
		)
			return null

		return r.metadata.duration
	}

	/**
	 * Returns sum duration of all elements to given index.
	 * Returns null if it's not possible.
	 * Index must not be out of bounds and must be positive integer or 0.
	 */
	getDurationToIndex = (i: number, inclusive = false): number | null => {
		let duration = this.sumDurationToIndex[i]
		if (duration < 0) return null
		if (!inclusive) return duration

		const result = this.innerResults[i]
		if (
			result &&
			result.type === MetadataLoadingResultType.OK &&
			typeof result.metadata.duration === "number" &&
			result.metadata.duration >= 0
		) {
			duration += result.metadata.duration
		} else {
			return null
		}

		return duration
	}

	/**
	 * Returns index of entry, which contains specified absolute position.
	 * Returns `this.length` if position is after the end
	 */
	getIndexFromPosition = (position: number): number | null => {
		for (let i = 0; i < this.innerResults.length; i++) {
			const res = this.getDurationToIndex(i, true)
			if (res === null) return null

			if (position <= res) return i
		}

		return this.length
	}

	/**
	 * Returns true if metadata has been loaded for all entries contained in this bag.
	 */
	get isDone() {
		return this.innerIsDone
	}

	/**
	 * Returns total duration of this bag.
	 */
	get duration(): number | null {
		if (this.length === 0) return 0
		return this.getDurationToIndex(this.length - 1, true)
	}
}
