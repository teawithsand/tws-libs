import {
	BusAwaiter,
	DefaultEventBus,
	Subscribable,
	SubscriptionCanceler,
} from "@teawithsand/tws-stl"
import Peer, { DataConnection } from "peerjs"
import {
	makePeerDataConnBus,
	PeerDataConnEvent,
	PeerDataConnEventType,
} from "./dataConnBus"

/**
 * State, which describes data connection.
 * It's assembled from events and simplifies running protocol on data connection.
 */
export interface PeerDataConnectionState {
	readonly isClosed: boolean
	readonly error: Error | null
}

/**
 * Method, which has some domain logic implemented to deal with events incoming from DataConnection.
 */
export type PeerDataConnectionRunner = (
	peer: Peer,
	conn: DataConnection,
	state: PeerDataConnectionState,
	awaiter: PeerDataConnReceiver
) => Promise<void>

/**
 * Error, which may be thrown when receiving data.
 */
export class PeerDataConnAwaiterError extends Error {
	constructor(public readonly cause: Error) {
		super("PeerDataConnAwaiterError")
	}
}

/**
 * Error, which is thrown when client tries to receive some data and instead it receives close event.
 */
export class ClosedPeerDataConnAwaiterError extends Error {
	constructor() {
		super("ClosedPeerDataConnAwaiterError")
	}
}

/**
 * Abstraction layer over events sent by DataConnection created specifically to receive messages.
 */
export interface PeerDataConnReceiver {
	/**
	 * Receives all events until it receives data event.
	 * Returns it's value in that case.
	 *
	 * Throws PeerDataConnAwaiterError when error event is received or called in error state.
	 *
	 * Before handled, all events go through optional callback provided as argument.
	 */
	receiveData: (
		onUnhandledEvent?: (e: PeerDataConnEvent) => Promise<void>
	) => Promise<any>

	/**
	 * Receives any event from internal bus.
	 *
	 * It does not throw on error events.
	 */
	receiveEvent: () => Promise<PeerDataConnEvent>
}

/**
 * Adds some features to DataConnection, that make it more useful when developing apps with awaiter.
 *
 * In order to ensure that this handler will be called first, passed bus should not be used anymore in favour of bus
 * returned via `.bus` parameter.
 */
class DataConnStateHelperImpl implements PeerDataConnectionState {
	private readonly innerBus = new DefaultEventBus<PeerDataConnEvent>()
	private canceler: SubscriptionCanceler | null = null

	private innerLastError: Error | null = null
	private innerWasClosed: boolean = false

	get error(): Error | null {
		return this.innerLastError
	}

	get bus(): Subscribable<PeerDataConnEvent> {
		return this.innerBus
	}

	get isClosed() {
		return this.innerWasClosed || !!this.innerLastError
	}

	/**
	 * Unsubscribes this helper from bus it was given, allowing it to release resources.
	 * State won't be updated anymore.
	 */
	closeBus = () => {
		if (this.canceler) {
			this.canceler()
			this.canceler = null
		}
	}

	constructor(connBus: Subscribable<PeerDataConnEvent>) {
		this.canceler = connBus.addSubscriber((event) => {
			this.updateState(event)
			this.innerBus.emitEvent(event)
		})
	}

	private readonly updateState = (event: PeerDataConnEvent) => {
		if (event.type === PeerDataConnEventType.ERROR) {
			this.innerLastError = event.error
		} else if (event.type === PeerDataConnEventType.CLOSE) {
			this.innerWasClosed = true
		}
	}
}

/**
 * Function, which executes runner on PeerDataConnection.
 *
 * Automatically closes connection given just before it returns.
 *
 * It rethrows any exception that runner may throw.
 */
export const runPeerDataConnectionRunner = async (
	peer: Peer,
	conn: DataConnection,
	runner: PeerDataConnectionRunner
) => {
	const bus = makePeerDataConnBus(peer, conn)
	const helper = new DataConnStateHelperImpl(bus)
	const awaiter = new BusAwaiter(helper.bus)

	const connAwaiter: PeerDataConnReceiver = {
		receiveData: async (cb) => {
			if (helper.isClosed) throw new ClosedPeerDataConnAwaiterError()

			for (;;) {
				const ev = await awaiter.readEvent()

				if (cb) await cb(ev)

				if (ev.type === PeerDataConnEventType.ERROR) {
					throw new PeerDataConnAwaiterError(ev.error)
				} else if (ev.type === PeerDataConnEventType.DATA) {
					return ev.data
				} else if (ev.type === PeerDataConnEventType.CLOSE) {
					throw new ClosedPeerDataConnAwaiterError()
				}
			}
		},
		receiveEvent: async () => await awaiter.readEvent(),
	}

	try {
		await runner(peer, conn, helper, connAwaiter)
	} finally {
		awaiter.close()
		bus.close()

		conn.close()
	}
}
