import {
	DefaultEventBus,
	DefaultStickyEventBus,
	generateUUID,
	latePromise,
	StickySubscribable,
	Subscribable,
	SubscriptionCanceler,
	throwExpression,
} from "@teawithsand/tws-stl"
import Peer, { MediaConnection, PeerJSOption } from "peerjs"
import { makePeerBus, PeerEventType } from "../innerUtil"
import { IDataConnection, PeerJSIDataConnection } from "./dataConn"


// TODO(teawithsand): implement

export type IPeerState = {
	/**
	 * If true, this peer can open and receive connections.
	 * One has to wait for this event in order to make/receiver connections.
	 */
	isReady: boolean
	isActive: boolean
	/**
	 * Set to true, when inner peer was closed.
	 * It may be closed externally(although it shouldn't) but here is a way to check that.
	 *
	 * When it's set, isReady is also false.
	 */
	isClosed: boolean
	error: Error | null

	/**
	 * ID of this peer, if any.
	 */
	id: string | null

	config: IPeerConfig
}

export type IPeerConfig = {
	/**
	 * If true, then incoming data connections won't be automatically closed.
	 */
	acceptDataConnections?: boolean

	/**
	 * If true, then incoming media connections won't be automatically closed.
	 */
	acceptMediaConnections?: boolean
}

export enum IPeerEventType {
	ERROR = 1,
	MEDIA_CONN = 2,
	DATA_CONN = 3,
	DISCONNECT = 4,
	CLOSE = 5,
	OPEN = 6,
	ACTIVATE = 7,
	DEACTIVATE = 8,
}

export type IPeerEvent = {
	peer: IPeer
} & (
	| {
			type: IPeerEventType.ERROR
			error: Error
	  }
	| {
			type: IPeerEventType.DATA_CONN
			conn: IDataConnection
	  }
	| {
			type: IPeerEventType.DISCONNECT
	  }
	| {
			type: IPeerEventType.MEDIA_CONN
			conn: MediaConnection // FIXME(teawithsand): do not return raw media conn, but wrapper over it.
	  }
	| {
			type: IPeerEventType.CLOSE
	  }
	| {
			type: IPeerEventType.OPEN
			id: string
	  }
	| {
			type: IPeerEventType.ACTIVATE
	  }
	| {
			type: IPeerEventType.DEACTIVATE
	  }
)

/**
 * Abstraction layer over peerjs' peer. It's supposed to be mockable in future.
 */
export interface IPeer {
	readonly eventBus: Subscribable<IPeerEvent>
	readonly stateBus: StickySubscribable<IPeerState>

	setConfig: (config: IPeerConfig) => void
	updateConfig: (
		callback: (oldConfig: Readonly<IPeerConfig>) => IPeerConfig
	) => void
	connect: (remoteId: string) => Promise<IDataConnection>
	close: () => void
}

/**
 * IPeer implementation, which uses PeerJS peer.
 */
export class PeerJSIPeer implements IPeer {
	private innerPeer: Peer | null = null
	private innerPeerBusSubscriptionCanceler: SubscriptionCanceler | null = null

	private readonly innerEventBus = new DefaultEventBus<IPeerEvent>()
	private readonly innerConfigBus = new DefaultStickyEventBus<IPeerConfig>({})
	private readonly innerStateBus = new DefaultStickyEventBus<IPeerState>({
		isReady: false,
		isActive: false,
		isClosed: false,
		error: null,
		config: this.innerConfigBus.lastEvent,
		id: null,
	})

	constructor() {
		this.innerConfigBus.addSubscriber((config) => {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				config,
			})
		})
	}

	get eventBus(): Subscribable<IPeerEvent> {
		return this.innerEventBus
	}
	get stateBus(): StickySubscribable<IPeerState> {
		return this.innerStateBus
	}

	private innerHandleEvent = (event: IPeerEvent) => {
		if (event.type === IPeerEventType.ACTIVATE) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isActive: true,
			})
		} else if (event.type === IPeerEventType.DEACTIVATE) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isActive: false,
				isReady: false,
				isClosed: false,
				id: null,
				error: null,
			})
		} else if (event.type === IPeerEventType.OPEN) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isActive: true,
				isReady: true,
				id: event.id,
			})
		} else if (event.type === IPeerEventType.CLOSE) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isReady: false,
				isClosed: true,
			})
		} else if (event.type === IPeerEventType.ERROR) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				error: event.error,
				isReady: false,
			})
		}
		/**
		else if (event.type === IPeerEventType.DISCONNECT) {
			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				isReady: false,
			})
		}
		*/

		this.innerEventBus.emitEvent(event)
	}

	/**
	 * Inner PeerJS config to use.
	 * If null, then internally peer is not created and IPeer is not active and can't be used.
	 *
	 * Please note that each call to this function causes peer to restart.
	 */
	setPeerJsConfig = (config: PeerJSOption | null, id?: string) => {
		const tearDown = () => {
			if (!this.innerPeer) return

			this.innerPeer.destroy()
			this.innerHandleEvent({
				type: IPeerEventType.DEACTIVATE,
				peer: this,
			})

			if (this.innerPeerBusSubscriptionCanceler) {
				this.innerPeerBusSubscriptionCanceler()
				this.innerPeerBusSubscriptionCanceler = null
			}

			this.innerPeer = null
		}

		if (config === null) {
			tearDown()
		} else {
			tearDown()
			const idToUse = id || generateUUID()
			const peer = new Peer(idToUse, config)
			this.innerPeer = peer

			this.innerHandleEvent({
				type: IPeerEventType.ACTIVATE,
				peer: this,
			})

			const bus = makePeerBus(peer)

			const handleEvent = this.innerHandleEvent

			const unsubscribe = bus.addSubscriber((event) => {
				const config = this.innerConfigBus.lastEvent

				if (event.type === PeerEventType.OPEN) {
					handleEvent({
						type: IPeerEventType.OPEN,
						peer: this,
						id: event.peer.id,
					})
				} else if (event.type === PeerEventType.CONNECT) {
					if (!config.acceptDataConnections) {
						try {
							event.conn.close()
						} catch (e) {
							console.error(
								"PeerJSIPeer: Filed to close not accepted data connection",
								e
							)
						}
					} else {
						handleEvent({
							type: IPeerEventType.DATA_CONN,
							peer: this,
							conn: new PeerJSIDataConnection(this, event.conn),
						})
					}
				} else if (event.type === PeerEventType.CALL) {
					if (!config.acceptMediaConnections) {
						try {
							event.call.close()
						} catch (e) {
							console.error(
								"PeerJSIPeer: Filed to close not accepted media connection",
								e
							)
						}
					} else {
						handleEvent({
							type: IPeerEventType.MEDIA_CONN,
							peer: this,
							conn: event.call, // FIXME(teawithsand): it wont work like that
						})
					}
				} else if (event.type === PeerEventType.CLOSE) {
					handleEvent({
						type: IPeerEventType.CLOSE,
						peer: this,
					})
				} else if (event.type === PeerEventType.ERROR) {
					handleEvent({
						type: IPeerEventType.ERROR,
						peer: this,
						error: event.error,
					})
				}
				/*
                // For now ignore disconnect event
                if (event.type === PeerEventType.DISCONNECT) {
					handleEvent({
						type: IPeerEventType.DISCONNECT,
						peer: this,
					})
				}
                */
			})
			this.innerPeerBusSubscriptionCanceler = () => {
				bus.close()
				unsubscribe()
			}
		}
	}

	setConfig = (config: IPeerConfig) => {
		this.innerConfigBus.emitEvent(config)
	}

	updateConfig = (
		callback: (oldConfig: Readonly<IPeerConfig>) => IPeerConfig
	) => {
		this.innerConfigBus.emitEvent(callback(this.innerConfigBus.lastEvent))
	}

	connect = async (remoteId: string): Promise<IDataConnection> => {
		const state = this.innerStateBus.lastEvent

		if (state.error) throw state.error

		if (!state.isActive)
			throw new Error("Can't open new connection, as peer is not active")

		if (!state.isReady) {
			const [promise, resolve, reject] = latePromise<void>()

			this.innerStateBus.addSubscriber((state, unsubscribe) => {
				if (state.error) {
					reject(state.error)
				} else if (!state.isActive) {
					reject(
						new Error(
							"Can't open new connection, as peer is not active"
						)
					)
					unsubscribe()
				} else if (state.isReady) {
					resolve()
					unsubscribe()
				}
			})

			await promise
		}

		const conn = (
			this.innerPeer ?? throwExpression(new Error("Unreachable code"))
		).connect(remoteId)

		return new PeerJSIDataConnection(this, conn)
	}

	/**
	 * Shortcut for setting null config.
	 * Releases all peer's resources.
	 */
	close = () => {
		this.setPeerJsConfig(null)
	}
}
