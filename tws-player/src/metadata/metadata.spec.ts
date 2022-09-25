import { MetadataBag } from "./bag"
import { MetadataLoadingResult, MetadataLoadingResultType } from "./metadata"

describe("MetadataBag", () => {
	it.each([
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			0,
			10,
		],
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: null,
					},
				},
			],
			10,
			null,
		],
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: null,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			null,
			null,
		],
	] as MetadataLoadingResult[][][])(
		"can store and read file",
		(results, exclusiveExpectedResult, inclusiveExpectedResult) => {
			const bag = new MetadataBag(
				results as (MetadataLoadingResult | null)[]
			)
			expect(bag.getDurationToIndex(results.length - 1)).toEqual(
				exclusiveExpectedResult
			)
			expect(bag.getDurationToIndex(results.length - 1, true)).toEqual(
				inclusiveExpectedResult
			)
		}
	)

	it.each([
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: null,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			2,
			0,
		],
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: null,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			10,
			0,
		],
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			12,
			1,
		],
		[
			[
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
				{
					type: MetadataLoadingResultType.OK,
					metadata: {
						duration: 10,
					},
				},
			],
			21,
			2,
		],
	])("can reverse duration into index", (results, position, index) => {
		const bag = new MetadataBag(results as (MetadataLoadingResult | null)[])
		expect(bag.getIndexFromPosition(position)).toEqual(index)
	})
})
