import {
	AsyncQueue,
	DefaultEventBus,
	DefaultStickyEventBus,
	Queue,
	StickySubscribable,
	Subscribable,
} from "@teawithsand/tws-stl"
import { DataConnection } from "peerjs"
import { makePeerDataConnBus, PeerDataConnEventType } from "../innerUtil"
import { TwsPeerError } from "../util"
import { IPeer } from "./peer"

export class IPeerDataConnectionTwsPeerError extends TwsPeerError {
	constructor(message: string) {
		super(message)
		this.name = "IDataConnTwsPeerError"
	}
}

export class ClosedIPeerDataConnectionTwsPeerError extends IPeerDataConnectionTwsPeerError {
	constructor(message: string) {
		super(message)
		this.name = "ClosedIPeerDataConnectionTwsPeerError"
	}
}

export class UnknownIPeerDataConnectionTwsPeerError extends IPeerDataConnectionTwsPeerError {
	constructor(message: string, public readonly cause: Error) {
		super(message)
		this.name = "UnknownIPeerDataConnectionTwsPeerError"
	}
}

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
	 *
	 * It does not throw if connection is closed, but there are some messages yet to be received.
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

	private isReceivedMessagesQueueClosed = false
	private readonly onAfterClosedReceivedMessagesQueue = new Queue<any>()
	private readonly receivedMessagesQueue = new AsyncQueue<any>()
	private readonly preSendQueue = new Queue<any>()

	private readonly innerHandleEvent = (event: IPeerDataConnectionEvent) => {
		if (event.type === IPeerDataConnectionEventType.ERROR) {
			const error = new UnknownIPeerDataConnectionTwsPeerError(
				"Received error from peerjs",
				event.error
			)
			this.innerOnError(error)
		} else if (event.type === IPeerDataConnectionEventType.CLOSE) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isClosed: true,
			})

			this.innerDoCleanup()
		} else if (event.type === IPeerDataConnectionEventType.OPEN) {
			const state = this.innerStateBus.lastEvent
			if (!state.isClosed && !state.error) {
				while (!this.preSendQueue.isEmpty) {
					const v = this.preSendQueue.pop()
					this.innerSendMessage(v)
				}
			}

			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isOpen: true,
			})
		}

		this.innerEventBus.emitEvent(event)
	}

	private innerDoCleanup = (e?: Error) => {
		if (!this.isReceivedMessagesQueueClosed) {
			this.isReceivedMessagesQueueClosed = true

			// This hack is required, since close may have been triggered by remote party BEFORE
			// we were able to receive all incoming messages.
			// So store them in separate instant-access queue, if there are some that is.
			while (this.receivedMessagesQueue.resultQueueLength > 0) {
				const v = this.receivedMessagesQueue.pop()
				this.onAfterClosedReceivedMessagesQueue.append(v)
			}

			this.preSendQueue.clear() // just in case it was not cleared
			this.receivedMessagesQueue.close(
				e ??
					new ClosedIPeerDataConnectionTwsPeerError(
						"PeerJSIDataConnection was closed and can't receive messages"
					)
			)

			try {
				this.innerConn.close()
			} catch (e) {}
		}
	}

	private innerOnError = (error: Error) => {
		const lastEvent = this.innerStateBus.lastEvent
		if (lastEvent.error === null && !lastEvent.isClosed) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				error,
				isClosed: true,
			})
			this.innerDoCleanup(error)
		}
	}

	private innerSendMessage = (msg: any, doThrow?: boolean) => {
		try {
			this.innerConn.send(msg)
		} catch (e) {
			if (doThrow) {
				throw e
			} else {
				this.innerOnError(
					new UnknownIPeerDataConnectionTwsPeerError(
						"PeerJS thrown while sending message",
						e instanceof Error ? e : new Error("Unknown error")
					)
				)
			}
		}
	}

	constructor(
		public readonly peer: IPeer,
		private readonly innerConn: DataConnection
	) {
		const bus = makePeerDataConnBus(innerConn)
		bus.addSubscriber((event) => {
			if (event.type === PeerDataConnEventType.OPEN) {
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
				if (!this.isReceivedMessagesQueueClosed) {
					// above condition should always be true.
					this.receivedMessagesQueue.append(event.data)
				}

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
				if (!self.onAfterClosedReceivedMessagesQueue.isEmpty)
					return self.onAfterClosedReceivedMessagesQueue.length
				if (self.isReceivedMessagesQueueClosed) return 0
				return self.receivedMessagesQueue.resultQueueLength
			},
			pop: () => {
				if (!this.onAfterClosedReceivedMessagesQueue.isEmpty) {
					return this.onAfterClosedReceivedMessagesQueue.pop()
				}

				if (self.isReceivedMessagesQueueClosed) return null

				return self.receivedMessagesQueue.pop()
			},
			receive: async () => {
				if (!this.onAfterClosedReceivedMessagesQueue.isEmpty) {
					return this.onAfterClosedReceivedMessagesQueue.pop()
				}

				if (self.isReceivedMessagesQueueClosed) {
					throw new ClosedIPeerDataConnectionTwsPeerError(
						"PeerJSIDataConnection was closed and can't send given message"
					)
				}

				// custom exception is
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
			throw new ClosedIPeerDataConnectionTwsPeerError(
				"PeerJSIDataConnection was closed and can't send given message"
			)
		}

		if (!state.isOpen) {
			this.preSendQueue.append(data)
		} else {
			this.innerSendMessage(data, true)
		}
	}

	close = () => {
		this.innerConn.close() // this should trigger cascade of events that are required to perform close
	}
}
