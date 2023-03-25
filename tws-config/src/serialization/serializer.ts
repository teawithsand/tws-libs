import { ClassTransformOptions, instanceToPlain } from "class-transformer"
import {
	ClassType,
	transformAndValidateSync,
	TransformValidationOptions,
} from "class-transformer-validator"

export interface Serializer<T, E> {
	serialize: (value: T) => E
	deserialize: (value: E) => T
}

/**
 * Noop serializer that returns values it's given during serialization and deserialization that is.
 */
export class IdentitySerializer<T> implements Serializer<T, T> {
	serialize = (value: T) => value
	deserialize = (value: T) => value
}

export class TransformAndValidateSerializer<T extends object>
	implements Serializer<T, Record<string, any>>
{
	constructor(
		public readonly clazz: ClassType<T>,
		public readonly serializationOptions?: Readonly<ClassTransformOptions>,
		public readonly deserializationOptions?: Readonly<TransformValidationOptions>
	) {}
	serialize = (value: T) => {
		if (!(value instanceof this.clazz)) {
			throw new Error(
				`Serialization filed - invalid value type provided; got ${value} expected ${this.clazz}`
			)
		}
		return instanceToPlain(value, this.serializationOptions)
	}

	deserialize = (value: Record<any, string> | string) => {
		const res = transformAndValidateSync<T>(
			this.clazz,
			JSON.stringify(value),
			this.deserializationOptions
		)

		if (!(res instanceof this.clazz)) {
			throw new Error(
				`Deserialization filed - invalid result type got ${res} expected ${this.clazz}`
			)
		}

		return res
	}
}
