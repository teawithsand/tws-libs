import {
	BusAwaiter,
	DefaultEventBus,
	Subscribable,
	SubscriptionCanceler,
} from "@teawithsand/tws-stl"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { makePeerBus, PeerEvent, PeerEventType } from "./peerBus"

/**
 * State, which describes data connection.
 * It's assembled from events and simplifies running protocol on data connection.
 */
export interface PeerState {
	readonly isClosed: boolean
	readonly error: Error | null
}

/**
 * Method, which has some domain logic implemented to deal with events incoming from Peer.
 */
export type PeerRunner = (
	peer: Peer,
	state: PeerState,
	receiver: PeerReceiver
) => Promise<void>

/**
 * Error, which may be thrown when receiving data from Peer.
 */
export class PeerReceiverError extends Error {
	constructor(public readonly cause: Error) {
		super("PeerDataConnAwaiterError")
	}
}

/**
 * Thrown when one is trying to receive some connection, but peer was closed instead.
 */
export class ClosedPeerReceiveError extends Error {
	constructor() {
		super("ClosedPeerReceiveError")
	}
}

/**
 * Abstraction layer over events sent by DataConnection created specifically to receive messages.
 */
export interface PeerReceiver {
	/**
	 * Also: automatically closes any media connections received.
	 */
	receiveDataConn: (
		onUnhandledEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<DataConnection>

	/**
	 * Also: automatically closes any data connections received.
	 */
	receiveMediaConn: (
		onUnhandledEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<MediaConnection>

	receiveDataOrMediaConn: (
		onUnhandledEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<MediaConnection | DataConnection>

	/**
	 * Receives any event from internal bus.
	 *
	 * It does not throw on error events.
	 */
	receiveEvent: () => Promise<PeerEvent>
}

/**
 * Adds some features to DataConnection, that make it more useful when developing apps with awaiter.
 *
 * In order to ensure that this handler will be called first, passed bus should not be used anymore in favour of bus
 * returned via `.bus` parameter.
 */
class PeerStateHelperImpl implements PeerState {
	private readonly innerBus = new DefaultEventBus<PeerEvent>()
	private canceler: SubscriptionCanceler | null = null

	private innerLastError: Error | null = null
	private innerWasClosed: boolean = false

	get error(): Error | null {
		return this.innerLastError
	}

	get bus(): Subscribable<PeerEvent> {
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

	constructor(connBus: Subscribable<PeerEvent>) {
		this.canceler = connBus.addSubscriber((event) => {
			this.updateState(event)
			this.innerBus.emitEvent(event)
		})
	}

	private readonly updateState = (event: PeerEvent) => {
		if (event.type === PeerEventType.ERROR) {
			this.innerLastError = event.error
		} else if (event.type === PeerEventType.CLOSE) {
			this.innerWasClosed = true
		}
	}
}

/**
 * Function, which executes runner on Peer.
 *
 * It destroys peer on before it returns.
 */
export const runPeerRunner = async (
	peer: Peer,
	runner: PeerRunner
) => {
	const bus = makePeerBus(peer)
	const helper = new PeerStateHelperImpl(bus)
	const awaiter = new BusAwaiter(helper.bus)

	const connAwaiter: PeerReceiver = {
		receiveDataConn: async (cb) => {
			if (helper.isClosed) throw new ClosedPeerReceiveError()

			for (;;) {
				const ev = await awaiter.readEvent()

				if (cb) await cb(ev)

				if (ev.type === PeerEventType.ERROR) {
					throw new PeerReceiverError(ev.error)
				} else if (ev.type === PeerEventType.CALL) {
					ev.call.close()
				} else if (ev.type === PeerEventType.CONNECT) {
					return ev.conn
				} else if (ev.type === PeerEventType.CLOSE) {
					throw new ClosedPeerReceiveError()
				}
			}
		},
		receiveMediaConn: async (cb) => {
			if (helper.isClosed) throw new ClosedPeerReceiveError()

			for (;;) {
				const ev = await awaiter.readEvent()

				if (cb) await cb(ev)

				if (ev.type === PeerEventType.ERROR) {
					throw new PeerReceiverError(ev.error)
				} else if (ev.type === PeerEventType.CALL) {
					return ev.call
				} else if (ev.type === PeerEventType.CONNECT) {
					ev.conn.close()
				} else if (ev.type === PeerEventType.CLOSE) {
					throw new ClosedPeerReceiveError()
				}
			}
		},
		receiveDataOrMediaConn: async (cb) => {
			if (helper.isClosed) throw new ClosedPeerReceiveError()

			for (;;) {
				const ev = await awaiter.readEvent()

				if (cb) await cb(ev)

				if (ev.type === PeerEventType.ERROR) {
					throw new PeerReceiverError(ev.error)
				} else if (ev.type === PeerEventType.CALL) {
					return ev.call
				} else if (ev.type === PeerEventType.CONNECT) {
					return ev.conn
				} else if (ev.type === PeerEventType.CLOSE) {
					throw new ClosedPeerReceiveError()
				}
			}
		},
		receiveEvent: async () => await awaiter.readEvent(),
	}

	try {
		await runner(peer, helper, connAwaiter)
	} finally {
		awaiter.close()
		bus.close()

		peer.destroy()
	}
}
