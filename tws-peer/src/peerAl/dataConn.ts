import {
	AsyncQueue,
	DefaultEventBus,
	DefaultStickyEventBus,
	Queue,
	StickySubscribable,
	Subscribable,
} from "@teawithsand/tws-stl"
import { DataConnection } from "peerjs"
import { makePeerDataConnBus, PeerDataConnEventType } from "../peerutil"
import { IPeer } from "./peer"

export enum IPeerDataConnectionEventType {
	OPEN = 1,
	CLOSE = 2,
	DATA = 3,
	ERROR = 4,
}

export type IPeerDataConnectionState = {
	isOpen: boolean
	isClosed: boolean
	error: Error | null
}

export type IPeerDataConnectionEvent = {
	conn: IDataConnection
} & (
	| {
			type: IPeerDataConnectionEventType.OPEN
	  }
	| {
			type: IPeerDataConnectionEventType.CLOSE
	  }
	| {
			type: IPeerDataConnectionEventType.DATA

			/**
			 * Note: user still has to pop from queue in order to prevent memory leak.
			 * Thus, using this data is allowed, but it's preferred not to do so.
			 */
			data: any
	  }
	| {
			type: IPeerDataConnectionEventType.ERROR
			error: Error
	  }
)

/**
 * Helper associated with data connection, which simplifies receiving messages.
 */
export interface IDataConnectionMessageQueue {
	readonly length: number
	pop: () => any | null

	/**
	 * This promise throws if conn is in closed/error state.
	 */
	receive: () => Promise<any>
}

/**
 * Abstraction layer over peerjs' data connection. It's supposed to be mockable in future.
 */
export interface IDataConnection {
	readonly peer: IPeer
	readonly eventBus: Subscribable<IPeerDataConnectionEvent>
	readonly stateBus: StickySubscribable<IPeerDataConnectionState>
	readonly messageQueue: IDataConnectionMessageQueue

	/**
	 * Sends provided JS data to remote target.
	 *
	 * It's also allowed to enqueue messages to send until connection is open.
	 */
	send: (data: any) => void

	close: () => void
}

export class PeerJSIDataConnection implements IDataConnection {
	private readonly innerEventBus =
		new DefaultEventBus<IPeerDataConnectionEvent>()
	private readonly innerStateBus =
		new DefaultStickyEventBus<IPeerDataConnectionState>({
			error: null,
			isClosed: false,
			isOpen: false,
		})

	private readonly receivedMessagesQueue = new AsyncQueue<any>()
	private readonly preSendQueue = new Queue<any>()

	private readonly innerHandleEvent = (event: IPeerDataConnectionEvent) => {
		if (event.type === IPeerDataConnectionEventType.ERROR) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				error: event.error,
			})
		} else if (event.type === IPeerDataConnectionEventType.CLOSE) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isClosed: true,
			})
		} else if (event.type === IPeerDataConnectionEventType.OPEN) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isOpen: true,
			})
		}

		this.innerEventBus.emitEvent(event)
	}

	private innerSendMessage = (msg: any) => {
		try {
			this.innerConn.send(msg)
		} catch (e) {
			// ignore or log somehow.
			// In general. it should never happen, but may for some reason

			console.error("PeerJSIDataConnection inner peerjs failure", e)
		}
	}

	constructor(
		public readonly peer: IPeer,
		private readonly innerConn: DataConnection
	) {
		const bus = makePeerDataConnBus(innerConn)
		bus.addSubscriber((event) => {
			if (event.type === PeerDataConnEventType.OPEN) {
				while (!this.preSendQueue.isEmpty) {
					const v = this.preSendQueue.pop()
					this.innerSendMessage(v)
				}

				this.innerHandleEvent({
					type: IPeerDataConnectionEventType.OPEN,
					conn: this,
				})
			} else if (event.type === PeerDataConnEventType.CLOSE) {
				this.innerHandleEvent({
					type: IPeerDataConnectionEventType.CLOSE,
					conn: this,
				})
			} else if (event.type === PeerDataConnEventType.DATA) {
				this.receivedMessagesQueue.append(event.data)

				this.innerHandleEvent({
					type: IPeerDataConnectionEventType.DATA,
					conn: this,
					data: event.data,
				})
			} else if (event.type === PeerDataConnEventType.ERROR) {
				this.innerHandleEvent({
					type: IPeerDataConnectionEventType.ERROR,
					conn: this,
					error: event.error,
				})
			}
		})
	}

	public readonly messageQueue: IDataConnectionMessageQueue = (() => {
		const self = this
		return {
			get length() {
				return self.receivedMessagesQueue.resultQueueLength
			},
			pop: () => {
				return self.receivedMessagesQueue.pop()
			},
			receive: async () => {
				// TODO(teawithsand): intercept and throw custom exception here
				const v = await self.receivedMessagesQueue.popAsync()
				return v
			},
		}
	})()

	get eventBus(): Subscribable<IPeerDataConnectionEvent> {
		return this.innerEventBus
	}
	get stateBus(): StickySubscribable<IPeerDataConnectionState> {
		return this.innerStateBus
	}

	send = (data: any) => {
		const state = this.innerStateBus.lastEvent
		if (state.isClosed) {
			throw new Error("Conn already closed")
		}

		if (!state.isOpen) {
			this.preSendQueue.append(data)
		} else {
			this.innerSendMessage(data)
		}
	}

	close = () => {
		this.innerConn.close()
	}
}
