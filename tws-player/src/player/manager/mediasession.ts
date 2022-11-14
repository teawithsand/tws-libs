import {
	MediaSessionApiHelper,
	MediaSessionEventType,
} from "@teawithsand/tws-stl"
import { Manager } from "../../util/manager"
import { Player } from "../player"

/**
 * Manager, which implements default behavior of reacting to media session events for player.
 *
 * It uses global MediaSessionApiHelper.
 * @see MediaSessionApiHelper
 * 
 * Do not use it if you want custom behavior. Hook directly to event bus instead.
 * This class is kind of showcase with some reasonable defaults.
 */
export class MediaSessionPlayerManager implements Manager {
	constructor(private readonly player: Player<any, any>) {}
	private innerIsEnabled = false

	private releaser: (() => void) | null = null

	get isEnabled() {
		return this.innerIsEnabled
	}

	private readonly mediaSessionHelper = MediaSessionApiHelper.instance

	setEnabled(enabled: boolean): void {
		this.innerIsEnabled = enabled

		if (!enabled && this.releaser) {
			this.releaser()
		} else {
			const releaseStateBus = this.player.stateBus.addSubscriber(
				(state) => {}
			)
			const releaseMediaSessionHelperBus =
				this.mediaSessionHelper.eventBus.addSubscriber((state) => {
					if (state.type === MediaSessionEventType.PLAY) {
						this.player.mutateConfig((draft) => {
							draft.isPlayingWhenReady = true
						})
					} else if (state.type === MediaSessionEventType.PAUSE) {
						this.player.mutateConfig((draft) => {
							draft.isPlayingWhenReady = false
						})
					} else if (
						state.type === MediaSessionEventType.NEXT_TRACK
					) {
						this.player.mutateConfig((draft) => {
							draft.sourceKey =
								this.player.sourceProvider.getNextSourceKey(
									draft.sourceKey
								)
						})
					} else if (
						state.type === MediaSessionEventType.PREVIOUS_TRACK
					) {
						this.player.mutateConfig((draft) => {
							draft.sourceKey =
								this.player.sourceProvider.getPrevSourceKey(
									draft.sourceKey
								)
						})
					} else if (state.type === MediaSessionEventType.STOP) {
						this.player.mutateConfig((draft) => {
							draft.sourceKey = null
						})
					}

					// TODO(teawithsand): implement seeking here
				})
			this.releaser = () => {
				releaseStateBus()
				releaseMediaSessionHelperBus()
			}
		}
	}
}
