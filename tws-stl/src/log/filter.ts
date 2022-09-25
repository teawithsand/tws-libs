import { Log, LogLevel, LogMessage } from "./log"

export type LogFilter = (msg: LogMessage) => boolean

export class FilteringLog implements Log {
	private filters: LogFilter[] = []
	constructor(private readonly inner: Log) {}

	log = (tag: string, level: LogLevel, ...args: any[]): void => {
		const msg: LogMessage = {
			tag,
			level,
			args,
		}

		for (const f of this.filters) {
			if (!f(msg)) return
		}

		this.inner.log(tag, level, ...args)
	}

	addFilter = (filter: LogFilter) => {
		const i = this.filters.length
		this.filters.push(filter)

		return () => {
			this.filters = this.filters.filter((_, idx) => idx !== i)
		}
	}
}
