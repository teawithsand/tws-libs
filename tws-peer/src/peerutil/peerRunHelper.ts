import {
	BusAwaiter,
	DefaultEventBus,
	DefaultStickyEventBus,
	StickySubscribable,
	Subscribable,
	SubscriptionCanceler,
} from "@teawithsand/tws-stl"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { PeerEvent, PeerEventType } from "./peerBus"

/**
 * State, which describes data connection.
 * It's assembled from events and simplifies running protocol on data connection.
 */
export interface PeerState {
	readonly isClosed: boolean
	readonly error: Error | null
}

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
		onEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<DataConnection>

	/**
	 * Also: automatically closes any data connections received.
	 */
	receiveMediaConn: (
		onEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<MediaConnection>

	receiveDataOrMediaConn: (
		onEvent?: (e: PeerEvent) => Promise<void>
	) => Promise<MediaConnection | DataConnection>

	/**
	 * Receives any event from internal bus.
	 *
	 * It does not throw on error events.
	 */
	receiveEvent: () => Promise<PeerEvent>
}

/**
 * Default implementation of PeerReceiver, which uses peer's bus.
 *
 * It does not take ownership of peer or bus it's given.
 * It automatically closes itself on bus closed event.
 *
 * It also maintains PeerState, so it's simpler to use with all conn/event receiving methods.
 */
export class DefaultPeerReceiver implements PeerReceiver {
	private closerUnsubscribe: SubscriptionCanceler | null
	private readonly innerStateBus = new DefaultStickyEventBus<PeerState>({
		error: null,
		isClosed: false,
	})

	private readonly awaiterBus = new DefaultEventBus<PeerEvent>()

	constructor(
		private readonly bus: Subscribable<PeerEvent>,
		public readonly peer: Peer
	) {
		this.closerUnsubscribe = this.bus.addSubscriber((e) => {
			if (e.type === PeerEventType.ERROR) {
				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					error: e.error,
				})
			} else if (e.type === PeerEventType.CLOSE) {
				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					isClosed: true,
				})
			} else if (e.type === PeerEventType.BUS_CLOSE) {
				this.close()
			}

			this.awaiterBus.emitEvent(e)
		})
	}
	private readonly awaiter = new BusAwaiter(this.awaiterBus)
	private innerIsClosed = false

	get stateBus(): StickySubscribable<PeerState> {
		return this.innerStateBus
	}

	get state(): Readonly<PeerState> {
		return this.innerStateBus.lastEvent
	}

	get isClosed() {
		return this.innerIsClosed
	}

	close = () => {
		if (!this.innerIsClosed) {
			if (this.closerUnsubscribe) {
				this.closerUnsubscribe()
				this.closerUnsubscribe = null // free res for gc
			}

			this.innerIsClosed = true
			this.awaiter.close()
		}
	}

	receiveDataConn = async (
		onEvent?: ((e: PeerEvent) => Promise<void>) | undefined
	): Promise<DataConnection> => {
		for (;;) {
			if (this.isClosed || this.state.isClosed)
				throw new ClosedPeerReceiveError()
			const ev = await this.awaiter.readEvent()

			if (onEvent) await onEvent(ev)

			if (ev.type === PeerEventType.ERROR) {
				throw new PeerReceiverError(ev.error)
			} else if (ev.type === PeerEventType.CALL) {
				ev.call.close()
			} else if (ev.type === PeerEventType.CONNECT) {
				return ev.conn
			} else if (
				ev.type === PeerEventType.CLOSE ||
				ev.type === PeerEventType.BUS_CLOSE
			) {
				throw new ClosedPeerReceiveError()
			}
		}
	}

	receiveMediaConn = async (
		onEvent?: ((e: PeerEvent) => Promise<void>) | undefined
	): Promise<MediaConnection> => {
		for (;;) {
			if (this.isClosed || this.state.isClosed)
				throw new ClosedPeerReceiveError()
			const ev = await this.awaiter.readEvent()

			if (onEvent) await onEvent(ev)

			if (ev.type === PeerEventType.ERROR) {
				throw new PeerReceiverError(ev.error)
			} else if (ev.type === PeerEventType.CALL) {
				return ev.call
			} else if (ev.type === PeerEventType.CONNECT) {
				ev.conn.close()
			} else if (
				ev.type === PeerEventType.CLOSE ||
				ev.type === PeerEventType.BUS_CLOSE
			) {
				throw new ClosedPeerReceiveError()
			}
		}
	}

	receiveDataOrMediaConn = async (
		onEvent?: ((e: PeerEvent) => Promise<void>) | undefined
	): Promise<DataConnection | MediaConnection> => {
		for (;;) {
			if (this.isClosed || this.state.isClosed)
				throw new ClosedPeerReceiveError()
			const ev = await this.awaiter.readEvent()

			if (onEvent) await onEvent(ev)

			if (ev.type === PeerEventType.ERROR) {
				throw new PeerReceiverError(ev.error)
			} else if (ev.type === PeerEventType.CALL) {
				return ev.call
			} else if (ev.type === PeerEventType.CONNECT) {
				return ev.conn
			} else if (
				ev.type === PeerEventType.CLOSE ||
				ev.type === PeerEventType.BUS_CLOSE
			) {
				throw new ClosedPeerReceiveError()
			}
		}
	}

	receiveEvent = async (): Promise<PeerEvent> => {
		if (this.isClosed || this.state.isClosed)
			throw new ClosedPeerReceiveError()
		return await this.awaiter.readEvent()
	}
}
