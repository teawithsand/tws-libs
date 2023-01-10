import { DefaultEventBus, Subscribable } from "@teawithsand/tws-stl"
import { DataConnection, MediaConnection, Peer } from "./peer"

export enum PeerConnEventType {
	OPEN = 1,
	CLOSE = 2,
	DATA = 3,
	ERROR = 4,
	ICE_STATE_CHANGE = 5,
}

export type PeerConnEvent = {
	peer: Peer
	conn: DataConnection
} & (
	| {
			type: PeerConnEventType.OPEN
	  }
	| {
			type: PeerConnEventType.CLOSE
	  }
	| {
			type: PeerConnEventType.DATA
			data: any
	  }
	| {
			type: PeerConnEventType.ERROR
			error: Error
	  }
	| {
			type: PeerConnEventType.ICE_STATE_CHANGE
			state: RTCIceConnectionState
	  }
)

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

export const makeDataConnBus = (
	peer: Peer,
	conn: DataConnection
): Subscribable<PeerConnEvent> & {
	close: () => void
} => {
	const b = new DefaultEventBus<PeerConnEvent>()

	const onOpen = () => {
		b.emitEvent({
			conn,
			peer,
			type: PeerConnEventType.OPEN,
		})
	}
	const onClose = () => {
		b.emitEvent({
			conn,
			peer,
			type: PeerConnEventType.CLOSE,
		})
	}
	const onData = (data: any) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerConnEventType.DATA,
			data,
		})
	}
	const onError = (error: Error) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerConnEventType.ERROR,
			error,
		})
	}
	const onIceStateChange = (state: RTCIceConnectionState) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerConnEventType.ICE_STATE_CHANGE,
			state,
		})
	}
	conn.on("open", onOpen)
	conn.on("close", onClose)
	conn.on("data", onData)
	conn.on("error", onError)
	conn.on("iceStateChanged", onIceStateChange)

	return {
		addSubscriber: b.addSubscriber,
		close: () => {
			conn.off("open", onOpen)
			conn.off("close", onClose)
			conn.off("data", onData)
			conn.off("error", onError)
			conn.off("iceStateChanged", onIceStateChange)
		},
	}
}

export const makePeerBus = (
	peer: Peer
): Subscribable<PeerEvent> & {
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

		conn.on("open", () => {})
		conn.on("close", () => {})
		conn.on("data", (data) => {})
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
