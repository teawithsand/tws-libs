import { DefaultStickyEventBus, StickySubscribable } from "../eventBus"

export enum GeolocationErrorCode {
	PERMISSION_DENIED = "permissionDenied",
	POSITION_UNAVAILABLE = "positionUnavailable",
	TIMEOUT = "timeout",
	NOT_SUPPORTED = "notSupported",
	UNKNOWN = "unknown",
}

export class GeolocationError extends Error {
	constructor(
		message: string,
		public readonly code: GeolocationErrorCode,
		public readonly cause?: any
	) {
		super(message)
	}
}

const makeGeolocationError = (e: any) => {
	if (e instanceof GeolocationPositionError) {
		const code = explainGeolocationError(e)
		return new GeolocationError("Geolocation claim filed", code, e)
	} else {
		return new GeolocationError(
			"Geolocation claim filed",
			GeolocationErrorCode.UNKNOWN,
			e
		)
	}
}

// See
// https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
type IGeolocationPosition = {
	timestamp: number // https://developer.mozilla.org/en-US/docs/Web/API/EpochTimeStamp
	coordinates: {
		latitude: number // decimal degrees
		longitude: number // decimal degrees
		altitude: number | null // meters relative to sea level
		accuracy: number // +/- value in meters
		altitudeAccuracy: number | null // +/- value in meters
		heading: number | null // degrees from 0 to 359.(9) or NaN
		speed: number | null // meter per second
	} | null
}

const makePosition = (e: GeolocationPosition): IGeolocationPosition => {
	// Note: for some reason spread operator
	// does not work for GeolocationCoordinates object
	// so one has to do this like that
	return {
		timestamp: e.timestamp,
		coordinates:
			"latitude" in e.coords && "longitude" in e.coords
				? {
						latitude: e.coords.latitude,
						longitude: e.coords.longitude,
						accuracy: e.coords.accuracy,
						altitude: e.coords.altitude,
						altitudeAccuracy: e.coords.altitudeAccuracy,
						heading: e.coords.heading,
						speed: e.coords.speed,
				  }
				: null,
	}
}

export type GeolocationEvent =
	| {
			type: "initializing"
	  }
	| {
			type: "position"
			position: IGeolocationPosition
	  }
	| {
			type: "error"
			error: GeolocationError
	  }

const explainGeolocationError = (
	e: GeolocationPositionError
): GeolocationErrorCode => {
	const { code } = e
	if (code === 1) {
		return GeolocationErrorCode.PERMISSION_DENIED
	} else if (code === 2) {
		return GeolocationErrorCode.POSITION_UNAVAILABLE
	} else if (code === 3) {
		return GeolocationErrorCode.TIMEOUT
	}
	return GeolocationErrorCode.UNKNOWN
}

export type GeolocationClaim = {
	readonly isClosed: boolean
	bus: StickySubscribable<GeolocationEvent>
	close: () => void
}

const DEFAULT_READ_POSITION_OPTIONS: ReadPositionOptions = {
	enableHighAccuracy: false,
	maximumAge: 0,
	timeout: Infinity,
}

// See
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
// Options parameter
export type ReadPositionOptions = {
	maximumAge?: number // in ms; how long backwards cache call is ok; default 0
	timeout?: number // in ms; how long for new position(in ms); default Infinity
	enableHighAccuracy?: boolean // if true better accuracy but slower, default false
}

export class GeolocationApiHelper {
	private static innerInstance = new GeolocationApiHelper()
	static get instance() {
		return this.innerInstance
	}

	private constructor() {}

	public get isSupported() {
		return (
			typeof window !== "undefined" &&
			typeof window.navigator !== "undefined" &&
			"geolocation" in window.navigator
		)
	}

	readPosition = async (
		options: Partial<ReadPositionOptions>
	): Promise<IGeolocationPosition> => {
		if (!this.isSupported) {
			throw new GeolocationError(
				"Geolocation not supported",
				GeolocationErrorCode.NOT_SUPPORTED
			)
		}

		const p = new Promise<IGeolocationPosition>((resolve, reject) => {
			window.navigator.geolocation.getCurrentPosition(
				(e) => {
					resolve(makePosition(e))
				},
				(e) => reject(makeGeolocationError(e)),
				{
					...DEFAULT_READ_POSITION_OPTIONS,
					...options,
				}
			)
		})

		try {
			return await p
		} catch (e) {
			throw makeGeolocationError(e)
		}
	}

	createReadClaim = (
		options: Partial<ReadPositionOptions>
	): GeolocationClaim => {
		if (!this.isSupported) {
			throw new GeolocationError(
				"Geolocation not supported",
				GeolocationErrorCode.NOT_SUPPORTED
			)
		}

		let isClosed = false

		const bus = new DefaultStickyEventBus<GeolocationEvent>({
			type: "initializing",
		})

		let resolved = false
		let handle: number | null = null

		const cleanup = () => {
			isClosed = true
			if (!resolved) {
				// log error here?
			}

			if (handle !== null) {
				window.navigator.geolocation.clearWatch(handle)
				handle = null
			}
		}

		new Promise<void>((resolve, reject) => {
			try {
				handle = window.navigator.geolocation.watchPosition(
					(e) => {
						// if (!hasError) {
						bus.emitEvent({
							type: "position",
							position: makePosition(e),
						})
						//}
						if (!resolved) {
							resolved = true

							resolve()
						}
					},
					(e) => {
						const explained = makeGeolocationError(e)

						if (!resolved) {
							resolved = true
							reject(e)
						}
						bus.emitEvent({
							type: "error",
							error: explained,
						})

						// cleanup()
					},
					options
				)
			} catch (e) {
				const explained = makeGeolocationError(e)
				bus.emitEvent({
					type: "error",
					error: explained,
				})
				if (!resolved) {
					resolved = true
					reject(explained)
				}
				cleanup()
			}
		}).catch(() => {
			// noop
		})

		return {
			get isClosed() {
				return isClosed
			},
			close: () => {
				cleanup()
			},
			bus,
		}
	}
}

export { IGeolocationPosition as GeolocationPosition }
