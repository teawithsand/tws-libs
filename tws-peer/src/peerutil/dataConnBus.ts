import { DefaultEventBus } from "@teawithsand/tws-stl"
import Peer, { DataConnection } from "peerjs"
import { ClosableSubscribable } from "../util"

export interface PeerDataConnSubscribable
	extends ClosableSubscribable<PeerDataConnEvent> {
	readonly peer: Peer
	readonly conn: DataConnection
}

export enum PeerDataConnEventType {
	OPEN = 1,
	CLOSE = 2,
	DATA = 3,
	ERROR = 4,
	ICE_STATE_CHANGE = 5,
	BUS_CLOSED = 6,
}

export type PeerDataConnEvent = {
	peer: Peer
	conn: DataConnection
} & (
	| {
			type: PeerDataConnEventType.OPEN
	  }
	| {
			type: PeerDataConnEventType.CLOSE
	  }
	| {
			type: PeerDataConnEventType.DATA
			data: any
	  }
	| {
			type: PeerDataConnEventType.ERROR
			error: Error
	  }
	| {
			type: PeerDataConnEventType.ICE_STATE_CHANGE
			state: RTCIceConnectionState
	  }
	| {
			type: PeerDataConnEventType.BUS_CLOSED
	  }
)

export const makePeerDataConnBus = (
	peer: Peer,
	conn: DataConnection
): PeerDataConnSubscribable => {
	const b = new DefaultEventBus<PeerDataConnEvent>()

	const onOpen = () => {
		b.emitEvent({
			conn,
			peer,
			type: PeerDataConnEventType.OPEN,
		})
	}
	const onClose = () => {
		b.emitEvent({
			conn,
			peer,
			type: PeerDataConnEventType.CLOSE,
		})
	}
	const onData = (data: any) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerDataConnEventType.DATA,
			data,
		})
	}
	const onError = (error: Error) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerDataConnEventType.ERROR,
			error,
		})
	}
	const onIceStateChange = (state: RTCIceConnectionState) => {
		b.emitEvent({
			conn,
			peer,
			type: PeerDataConnEventType.ICE_STATE_CHANGE,
			state,
		})
	}
	conn.on("open", onOpen)
	conn.on("close", onClose)
	conn.on("data", onData)
	conn.on("error", onError)
	conn.on("iceStateChanged", onIceStateChange)

	let wasBusClosed = false

	return {
		peer,
		conn,
		addSubscriber: b.addSubscriber,
		close: () => {
			if (wasBusClosed) return
			wasBusClosed = true
			
			conn.off("open", onOpen)
			conn.off("close", onClose)
			conn.off("data", onData)
			conn.off("error", onError)
			conn.off("iceStateChanged", onIceStateChange)

			b.emitEvent({
				type: PeerDataConnEventType.BUS_CLOSED,
				peer,
				conn,
			})
		},
	}
}
