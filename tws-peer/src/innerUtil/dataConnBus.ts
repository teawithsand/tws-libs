import { DefaultEventBus } from "@teawithsand/tws-stl"
import { DataConnection } from "peerjs"
import { ClosableSubscribable } from "../util/closable"

export interface PeerDataConnSubscribable
	extends ClosableSubscribable<PeerDataConnEvent> {
	readonly conn: DataConnection
}

export enum PeerDataConnEventType {
	OPEN = 1,
	CLOSE = 2,
	DATA = 3,
	ERROR = 4,
	ICE_STATE_CHANGE = 5,
	BUS_CLOSE = 6,
}

export type PeerDataConnEvent = {
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
			type: PeerDataConnEventType.BUS_CLOSE
	  }
)

export const makePeerDataConnBus = (
	conn: DataConnection
): PeerDataConnSubscribable => {
	const b = new DefaultEventBus<PeerDataConnEvent>()

	let wasBusClosed = false
	let close: () => void

	const onOpen = () => {
		b.emitEvent({
			conn,
			type: PeerDataConnEventType.OPEN,
		})
	}
	const onClose = () => {
		b.emitEvent({
			conn,
			type: PeerDataConnEventType.CLOSE,
		})
		close()
	}
	const onData = (data: any) => {
		b.emitEvent({
			conn,
			type: PeerDataConnEventType.DATA,
			data,
		})
	}
	const onError = (error: Error) => {
		b.emitEvent({
			conn,
			type: PeerDataConnEventType.ERROR,
			error,
		})
	}
	const onIceStateChange = (state: RTCIceConnectionState) => {
		b.emitEvent({
			conn,
			type: PeerDataConnEventType.ICE_STATE_CHANGE,
			state,
		})
	}

	close = () => {
		if (wasBusClosed) return
		wasBusClosed = true

		conn.off("open", onOpen)
		conn.off("close", onClose)
		conn.off("data", onData)
		conn.off("error", onError)
		conn.off("iceStateChanged", onIceStateChange)

		b.emitEvent({
			type: PeerDataConnEventType.BUS_CLOSE,
			conn,
		})
	}

	conn.on("open", onOpen)
	conn.on("close", onClose)
	conn.on("data", onData)
	conn.on("error", onError)
	conn.on("iceStateChanged", onIceStateChange)

	return {
		conn,
		addSubscriber: b.addSubscriber,
		close,
	}
}
