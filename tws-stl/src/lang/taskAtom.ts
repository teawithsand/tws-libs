export interface TaskAtomHandle {
	readonly isValid: boolean
}

export interface TaskAtom {
	invalidate(): void
	claim(): TaskAtomHandle
}

export class DefaultTaskAtom implements TaskAtom {
	private id = -Number.MAX_SAFE_INTEGER

	invalidate = (): void => {
		this.id++
	}

	claim = (): TaskAtomHandle => {
		this.invalidate()
		const claimId = this.id
		const idGetter = () => this.id

		return {
			get isValid() {
				return idGetter() === claimId
			},
		}
	}
}
