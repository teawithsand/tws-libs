import { DefaultEventBus } from "@teawithsand/tws-stl"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { ClosableSubscribable } from "../util/closable"

export interface PeerSubscribable extends ClosableSubscribable<PeerEvent> {
	readonly peer: Peer
}

export enum PeerEventType {
	ERROR = 1,
	CALL = 3,
	CONNECT = 4,
	DISCONNECT = 5,
	CLOSE = 6,
	OPEN = 7,
	BUS_CLOSE = 8,
}
export type PeerEvent = {
	peer: Peer
} & (
	| {
			type: PeerEventType.ERROR
			error: Error
	  }
	| {
			type: PeerEventType.CONNECT
			conn: DataConnection
	  }
	| {
			type: PeerEventType.DISCONNECT
			currentId: string
	  }
	| {
			type: PeerEventType.CALL
			call: MediaConnection
	  }
	| {
			type: PeerEventType.CLOSE
	  }
	| {
			type: PeerEventType.OPEN
			id: string
	  }
	| {
			type: PeerEventType.BUS_CLOSE
	  }
)

export const makePeerBus = (peer: Peer): PeerSubscribable => {
	const b = new DefaultEventBus<PeerEvent>()

	let wasBusClosed = false
	let close: () => void

	const onError = (err: Error) => {
		b.emitEvent({
			peer,
			type: PeerEventType.ERROR,
			error: err,
		})
	}
	const onConnect = (conn: DataConnection) => {
		b.emitEvent({
			peer,
			type: PeerEventType.CONNECT,
			conn,
		})
	}
	const onDisconnect = (currentId: string) => {
		b.emitEvent({
			peer,
			type: PeerEventType.DISCONNECT,
			currentId,
		})
	}
	const onCall = (call: MediaConnection) => {
		b.emitEvent({
			peer,
			type: PeerEventType.CALL,
			call,
		})
	}

	const onOpen = (id: string) => {
		b.emitEvent({
			peer,
			type: PeerEventType.OPEN,
			id,
		})
	}

	const onClose = () => {
		b.emitEvent({
			peer,
			type: PeerEventType.CLOSE,
		})

		close()
	}

	close = () => {
		if (wasBusClosed) return
		wasBusClosed = true

		peer.off("error", onError)
		peer.off("connection", onConnect)
		peer.off("disconnected", onDisconnect)
		peer.off("call", onCall)
		peer.off("open", onOpen)
		peer.off("close", onClose)

		b.emitEvent({
			type: PeerEventType.BUS_CLOSE,
			peer,
		})
	}

	peer.on("error", onError)
	peer.on("connection", onConnect)
	peer.on("disconnected", onDisconnect)
	peer.on("call", onCall)
	peer.on("close", onClose)
	peer.on("open", onOpen)

	return {
		peer,
		addSubscriber: b.addSubscriber,
		close,
	}
}
