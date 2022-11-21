export interface TaskAtomHandle {
	readonly isValid: boolean
	addCleaner: (c: () => void) => void
}

export interface TaskAtom {
	invalidate(): void
	claim(): TaskAtomHandle
}

export class DefaultTaskAtom implements TaskAtom {
	private id = -Number.MAX_SAFE_INTEGER
	private releasers: Array<() => void> = []

	invalidate = (): void => {
		this.id++
		this.releasers.forEach((c) => {
			try {
				c()
			} catch (e) {
				console.error("Error occurred when calling releaser", e)
			}
		})
		this.releasers = []
	}

	claim = (): TaskAtomHandle => {
		this.invalidate()
		const claimId = this.id
		const idGetter = () => this.id
		const isValid = () => idGetter() === claimId
		
		return {
			get isValid() {
				return isValid()
			},
			addCleaner: (c: () => void) => {
				if (!isValid()) {
					try {
						c()
					} catch (e) {
						console.error("Error occurred when calling releaser", e)
					}
				} else {
					this.releasers.push(c)
				}
			},
		}
	}
}
