import {
	DefaultEventBus,
	DefaultStickyEventBus,
	DefaultTaskAtom,
	EventBus,
	getNowPerformanceTimestamp,
	Interval,
	PerformanceTimestampMs,
	Subscribable,
	Timeout,
	StickyEventBus,
} from "@teawithsand/tws-stl"

export enum SleepEventType {
	SLEEP_BEGIN = 1,
	SLEEP_FINISHED = 2,
	SLEEP_VOLUME_TURN_PROGRESS = 3,
	SLEEP_CANCEL = 4,
}

export type SleepEvent =
	| {
			type: SleepEventType.SLEEP_BEGIN
			config: SleepConfig
	  }
	| {
			type: SleepEventType.SLEEP_FINISHED
	  }
	| {
			type: SleepEventType.SLEEP_CANCEL
	  }
	| {
			type: SleepEventType.SLEEP_VOLUME_TURN_PROGRESS
			volumeDownProgressMillis: number
			volumeDownDurationMillis: number
	  }

export enum SleepStateType {
	IDLE = 0,
	PENDING = 1,
	TURNING_VOLUME_DOWN = 2,
}

export type SleepState =
	| {
			type: SleepStateType.IDLE
	  }
	| {
			type: SleepStateType.PENDING
			startedTs: PerformanceTimestampMs
			config: SleepConfig
	  }
	| {
			type: SleepStateType.TURNING_VOLUME_DOWN
			startedTs: PerformanceTimestampMs
			startedVolumeDownTs: PerformanceTimestampMs
			config: SleepConfig
	  }

export type SleepConfig = {
	mainDurationMillis: number
	volumeDownDurationMillis?: number
}

/**
 * Helper, which implements sleep with turn-volume-down-before-the-actual-end feature.
 */
export class SleepHelper {
	private readonly innerSleepEventBus: EventBus<SleepEvent>
	private readonly innerSleepStateBus: StickyEventBus<SleepState>

	get sleepEventBus(): Subscribable<SleepEvent> {
		return this.innerSleepEventBus
	}
	get stateBus(): Subscribable<SleepState> {
		return this.innerSleepStateBus
	}

	private readonly atom = new DefaultTaskAtom()

	private currentSleepRelease: (() => void) | null = null

	constructor() {
		this.innerSleepEventBus = new DefaultEventBus<SleepEvent>()
		this.innerSleepStateBus = new DefaultStickyEventBus<SleepState>({
			type: SleepStateType.IDLE,
		})
	}

	/**
	 * Sets sleep with given config.
	 */
	setSleep = (config: SleepConfig | null) => {
		if (this.currentSleepRelease) {
			this.innerSleepEventBus.emitEvent({
				type: SleepEventType.SLEEP_CANCEL,
			})

			this.currentSleepRelease()
			this.currentSleepRelease = null
		}

		const claim = this.atom.claim()

		if (config) {
			const startedTs = getNowPerformanceTimestamp()
			this.innerSleepStateBus.emitEvent({
				type: SleepStateType.PENDING,
				config,
				startedTs: startedTs,
			})

			this.innerSleepEventBus.emitEvent({
				type: SleepEventType.SLEEP_BEGIN,
				config,
			})

			const onSleepFinished = () => {
				if (!claim.isValid) return

				this.innerSleepEventBus.emitEvent({
					type: SleepEventType.SLEEP_FINISHED,
				})

				this.innerSleepStateBus.emitEvent({
					type: SleepStateType.IDLE,
				})

				// sleep is released by our actions
				this.currentSleepRelease = null
			}

			const { mainDurationMillis, volumeDownDurationMillis } = config

			let interval: Interval | null = null
			const timeout = new Timeout(mainDurationMillis, () => {
				if (!volumeDownDurationMillis) {
					onSleepFinished()
				} else {
					const onVolumeInterval = (progressMillis: number) => {
						if (!claim.isValid) return

						this.innerSleepEventBus.emitEvent({
							type: SleepEventType.SLEEP_VOLUME_TURN_PROGRESS,
							volumeDownDurationMillis,
							volumeDownProgressMillis: progressMillis,
						})
					}

					const volumeStartedTs = getNowPerformanceTimestamp()

					this.innerSleepStateBus.emitEvent({
						type: SleepStateType.TURNING_VOLUME_DOWN,
						config,
						startedTs: startedTs,
						startedVolumeDownTs: volumeStartedTs,
					})

					interval = new Interval(100, (interval) => {
						const now = getNowPerformanceTimestamp()
						const deltaMillis = now - volumeStartedTs

						const progressMillis = Math.min(
							volumeDownDurationMillis,
							deltaMillis
						)

						if (!claim.isValid) {
							interval.setIsEnabled(false)
							return
						}

						if (progressMillis >= volumeDownDurationMillis) {
							interval.setIsEnabled(false)
							onSleepFinished()
						} else {
							onVolumeInterval(progressMillis)
						}
					})
				}
			})

			this.currentSleepRelease = () => {
				this.atom.invalidate() // clear sleep

				// release early if possible
				timeout.clear()
				if (interval) interval.setIsEnabled(false)

				this.innerSleepEventBus.emitEvent({
					type: SleepEventType.SLEEP_CANCEL,
				})
			}
		}
	}
}
