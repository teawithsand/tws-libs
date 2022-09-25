/**
 * Managed timeout, which starts when it's constructed.
 */
export class Timeout {
	private timer: (any & {}) | null = null

	constructor(
		public readonly timeoutMillis: number,
		callback: (self: Timeout) => void | Promise<void>,
	) {
		this.timer = setTimeout(() => {
			this.timer = null
			callback(this)
		}, timeoutMillis)
	}

	/**
	 * Either canceled or called already
	 */
	get isDone() {
		return this.timer === null
	}

	clear = () => {
		if (this.timer) {
			clearTimeout(this.timer)
		}
		this.timer = null
	}
}

export class Interval {
	private timer: (any & {}) | null = null

	constructor(
		public readonly intervalMillis: number,
		private readonly callback: (self: Interval) => void | Promise<void>,
		isEnabled: boolean = true
	) {
		if (isEnabled) {
			this.initTimer()
		}
	}

	private initTimer = () => {
		this.timer = setInterval(() => {
			this.callback(this)
		}, this.intervalMillis)
	}

	get isEnabled() {
		return this.timer !== null
	}

	setIsEnabled = (enabled: boolean) => {
		if (enabled) {
			if (this.timer === null) {
				this.initTimer()
			}
		} else {
			if (this.timer !== null) {
				clearTimeout(this.timer)
			}
			this.timer = null
		}
	}
}
