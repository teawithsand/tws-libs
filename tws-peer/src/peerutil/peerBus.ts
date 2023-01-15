import { DefaultEventBus } from "@teawithsand/tws-stl"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { ClosableSubscribable } from "../util"

export enum PeerEventType {
	ERROR = 1,
	CALL = 3,
	CONNECT = 4,
	DISCONNECT = 5,
	CLOSE = 6,
	OPEN = 7,
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
)


export const makePeerBus = (
	peer: Peer
): ClosableSubscribable<PeerEvent> & {
	close: () => void
} => {
	const b = new DefaultEventBus<PeerEvent>()

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
	}

	peer.on("error", onError)
	peer.on("connection", onConnect)
	peer.on("disconnected", onDisconnect)
	peer.on("call", onCall)
	peer.on("close", onClose)
	peer.on("open", onOpen)

	return {
		addSubscriber: b.addSubscriber,
		close: () => {
			peer.off("error", onError)
			peer.off("connection", onConnect)
			peer.off("disconnected", onDisconnect)
			peer.off("call", onCall)
			peer.off("open", onOpen)
			peer.off("close", onClose)
		},
	}
}
