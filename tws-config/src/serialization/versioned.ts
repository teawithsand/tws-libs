import { Serializer } from "./serializer"

interface Versioned {
	version?: number
}

export type VersionedDeserializers<T, E extends Versioned> = {
	[versionNumber: number]: (data: E) => T
}

/**
 * Serializer, which simplifies versioning.
 *
 * It assumes that serializer produces only latest version of data.
 */
export class VersioningSerializer<T, E extends Versioned>
	implements Serializer<T, E>
{
	/**
	 * @param serializer Serializer to serialize latest configs.
	 * @param deserializers Deserializers(one per version) to use.
	 * @param versionFallback Version to use, if config given has none.
	 */
	constructor(
		private readonly serializer: (value: T) => E,
		private readonly deserializers: VersionedDeserializers<T, E>,
		private readonly versionFallback: number | undefined = undefined
	) {}

	serialize = (value: T): E => this.serializer(value)

	deserialize = (data: E) => {
		if (typeof data !== "object") {
			throw new Error(`Data provided has invalid type`)
		}

		const { version = this.versionFallback } = data
		if (typeof version !== "number") {
			throw new Error(`No version found in data provided`)
		}

		const deserializer = this.deserializers[version]
		if (!deserializer)
			throw new Error(
				`Deserializer for version: ${version} was not found`
			)

		return deserializer(data)
	}
}
