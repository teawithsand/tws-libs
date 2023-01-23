import {
	DefaultEventBus,
	DefaultStickyEventBus,
	StickySubscribable,
	Subscribable,
} from "@teawithsand/tws-stl"
import Peer, { PeerJSOption } from "peerjs"
import { ClosableSubscribable } from "../util"
import { makePeerBus, PeerEvent } from "./peerBus"

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
}

export class PeerHelper {
	private readonly innerPeerBus = new DefaultEventBus<PeerEvent>()

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
		if (peerBus) {
			peerBus.addSubscriber((e) => this.innerPeerBus.emitEvent(e))
		}

		this.innerStateBus.emitEvent({
			config: { config },
			peer: newPeer,
			bus: peerBus,
		})
	}
}
