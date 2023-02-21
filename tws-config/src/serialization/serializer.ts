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
