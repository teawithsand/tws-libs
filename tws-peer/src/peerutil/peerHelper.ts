import {
	DefaultEventBus,
	DefaultStickyEventBus,
	StickySubscribable,
	Subscribable,
	SubscriptionCanceler,
} from "@teawithsand/tws-stl"
import Peer, { PeerJSOption } from "peerjs"
import { ClosableSubscribable } from "../util"
import { makePeerBus, PeerEvent, PeerEventType } from "./peerBus"

export type PeerHelperConfig = {
	/**
	 * Set this to null in order to disable peer.
	 */
	config: PeerJSOption | null
}

export type PeerHelperState = {
	config: PeerHelperConfig
	peer: Peer | null
	bus: ClosableSubscribable<PeerEvent> | null

	peerState: {
		isClosed: boolean
		error: Error | null
	}
}

// TODO(teawithsand): move and consolidate all state tracking features of peer/data conn in bus helpers,
//  which should be remodeled and extended for this purpose.
export class PeerHelper {
	private readonly innerPeerBus = new DefaultEventBus<PeerEvent>()
	private innerUnsubscribeFromPeerBus: SubscriptionCanceler | null = null

	/**
	 * Peer bus in use, if any is available right now.
	 */
	get peerBus(): Subscribable<PeerEvent> {
		return this.innerPeerBus
	}

	private readonly innerStateBus = new DefaultStickyEventBus<PeerHelperState>(
		{
			config: {
				config: null,
			},
			peer: null,
			bus: null,
			peerState: {
				isClosed: true,
				error: null,
			},
		}
	)

	get stateBus(): StickySubscribable<PeerHelperState> {
		return this.innerStateBus
	}

	restart = () => {
		this.setConfig(this.stateBus.lastEvent.config.config)
	}

	setConfig = (config: PeerJSOption | null) => {
		const newPeer = config ? new Peer(config) : null
		const peerBus = newPeer ? makePeerBus(newPeer) : null

		const { peer: prevPeer, bus: prevBus } = this.innerStateBus.lastEvent

		if (prevPeer) {
			prevPeer.destroy()
		}
		if (prevBus) {
			prevBus.close()
		}
		if (this.innerUnsubscribeFromPeerBus) {
			this.innerUnsubscribeFromPeerBus()
			this.innerUnsubscribeFromPeerBus = null
		}
		if (peerBus) {
			peerBus.addSubscriber((e) => this.innerPeerBus.emitEvent(e))
		}

		this.innerUnsubscribeFromPeerBus =
			peerBus?.addSubscriber((event) => {
				const { lastEvent } = this.innerStateBus
				if (event.type === PeerEventType.ERROR) {
					this.innerStateBus.emitEvent({
						...lastEvent,
						peerState: {
							...lastEvent.peerState,
							error: event.error,
						},
					})
				} else if (
					event.type === PeerEventType.CLOSE ||
					event.type === PeerEventType.BUS_CLOSE
				) {
					this.innerStateBus.emitEvent({
						...lastEvent,
						peerState: {
							...lastEvent.peerState,
							isClosed: true,
						},
					})
				}
			}) ?? null

		this.innerStateBus.emitEvent({
			config: { config },
			peer: newPeer,
			bus: peerBus,
			peerState: {
				isClosed: false,
				error: null,
			},
		})
	}
}
