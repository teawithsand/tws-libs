export class BinaryReader {
	private intBuffer: Uint8Array

	constructor(private buffer: ArrayBuffer, private offset = 0) {
		this.intBuffer = new Uint8Array(buffer)
	}

	readStringFixed = (sz: number): string => {
		let s = ""
		for (let i = 0; i < sz; i++) {
			const b = this.intBuffer[i + this.offset]
			if (b === 0) break // emulate C's behavior on strings
			s += String.fromCharCode(b)
		}
		this.offset += sz
		return s
	}

	readDecimalIntFixed = (sz = 8): number => {
		const text = this.readStringFixed(sz)
		const n = parseInt(text)
		if (isNaN(n)) {
			throw new Error(`Read text ${text} is not valid number`)
		}
		return n
	}

	readUnsignedNumbers = (sz: number): number[] => {
		const res = []
		for (let i = 0; i < sz; i++) {
			res.push(this.intBuffer[this.offset + i])
		}

		return res
	}

	advance = (n: number) => {
		this.offset += n
	}
}
