export const collectAsyncIterable = async <T>(
	iterable: AsyncIterable<T>,
): Promise<T[]> => {
	const arr = []
	for await (const v of iterable) {
		arr.push(v)
	}
	return arr
}

export async function* makeAsyncIterable<T>(iterable: Iterable<T>) {
	for (const e of iterable) {
		yield e
	}
}
