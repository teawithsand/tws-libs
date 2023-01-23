import {
	BusAwaiter,
	DefaultEventBus,
	DefaultStickyEventBus,
	StickySubscribable,
	Subscribable,
	SubscriptionCanceler,
} from "@teawithsand/tws-stl"
import Peer, { DataConnection } from "peerjs"
import { PeerDataConnEvent, PeerDataConnEventType } from "./dataConnBus"

/**
 * State, which describes data connection.
 * It's assembled from events and simplifies running protocol on data connection.
 */
export interface PeerDataConnState {
	readonly isClosed: boolean
	readonly error: Error | null
}

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
		onEvent?: (e: PeerDataConnEvent) => Promise<void>
	) => Promise<any>

	/**
	 * Receives any event from internal bus.
	 *
	 * It does not throw on error events.
	 */
	receiveEvent: () => Promise<PeerDataConnEvent>
}

export class PeerDataConnReceiverImpl implements PeerDataConnReceiver {
	private closerUnsubscribe: SubscriptionCanceler | null
	private readonly innerStateBus =
		new DefaultStickyEventBus<PeerDataConnState>({
			error: null,
			isClosed: false,
		})

	private readonly awaiterBus = new DefaultEventBus<PeerDataConnEvent>()

	constructor(
		private readonly bus: Subscribable<PeerDataConnEvent>,
		public readonly peer: Peer,
		public readonly conn: DataConnection
	) {
		this.closerUnsubscribe = this.bus.addSubscriber((e) => {
			if (e.type === PeerDataConnEventType.ERROR) {
				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					error: e.error,
				})
			} else if (e.type === PeerDataConnEventType.CLOSE) {
				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					isClosed: true,
				})
			} else if (e.type === PeerDataConnEventType.BUS_CLOSE) {
				this.close()
			}

			this.awaiterBus.emitEvent(e)
		})
	}
	private readonly awaiter = new BusAwaiter(this.awaiterBus)
	private innerIsClosed = false

	get stateBus(): StickySubscribable<PeerDataConnState> {
		return this.innerStateBus
	}

	get state(): Readonly<PeerDataConnState> {
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

	receiveData = async (
		onEvent?: ((e: PeerDataConnEvent) => Promise<void>) | undefined
	): Promise<any> => {
		for (;;) {
			if (this.isClosed || this.state.isClosed)
				throw new ClosedPeerDataConnAwaiterError()
			const ev = await this.awaiter.readEvent()

			if (onEvent) await onEvent(ev)

			if (ev.type === PeerDataConnEventType.ERROR) {
				throw new PeerDataConnAwaiterError(ev.error)
			} else if (ev.type === PeerDataConnEventType.DATA) {
				return ev.data
			} else if (
				ev.type === PeerDataConnEventType.CLOSE ||
				ev.type === PeerDataConnEventType.BUS_CLOSE
			) {
				throw new ClosedPeerDataConnAwaiterError()
			}
		}
	}

	receiveEvent = async (): Promise<PeerDataConnEvent> => {
		if (this.isClosed || this.state.isClosed)
			throw new ClosedPeerDataConnAwaiterError()
		return await this.awaiter.readEvent()
	}
}
