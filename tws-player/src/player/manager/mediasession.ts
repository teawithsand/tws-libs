import {
	MediaSessionEvent,
	MediaSessionEventType,
	MediaSessionHelper,
	MediaSessionHelperImpl,
} from "../../mediasession"
import { Manager } from "../../util/manager"
import { Player } from "../player"

/**
 * Manager, which implements default behavior of reacting to media session events for player.
 */
export class MediaSessionPlayerManager implements Manager {
	constructor(
		private readonly player: Player<any, any>,
		private readonly mediaSessionHelper: MediaSessionHelperImpl = MediaSessionHelper,
	) {}
	private innerIsEnabled = false

	private releaser: (() => void) | null = null

	get isEnabled() {
		return this.innerIsEnabled
	}

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
							draft.currentSourceKey =
								this.player.sourceProvider.getNextSourceKey(
									draft.currentSourceKey
								)
						})
					} else if (
						state.type === MediaSessionEventType.PREVIOUS_TRACK
					) {
						this.player.mutateConfig((draft) => {
							draft.currentSourceKey =
								this.player.sourceProvider.getPrevSourceKey(
									draft.currentSourceKey
								)
						})
					} else if (state.type === MediaSessionEventType.STOP) {
						this.player.mutateConfig((draft) => {
							draft.currentSourceKey = null
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
