export class Once {
	private done = false

	private constructor() {
        // rather than constructor static fn should be used
    }

	static make(): Once {
		return new Once()
	}

	do = (f: () => void) => {
		if (!this.done) {
			f()
			this.done = true
		}
	}

	doAsync = async (f: () => Promise<void>) => {
		if (!this.done) {
			await f()
			this.done = false
		}
	}
}
