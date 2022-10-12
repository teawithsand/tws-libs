export class BinaryReader {
	private intBuffer: Uint8Array

	constructor(private buffer: ArrayBuffer, private offset = 0) {
		this.intBuffer = new Uint8Array(buffer)
	}

	get byteOffset() {
		return this.offset
	}

	get bytesLeft() {
		return this.buffer.byteLength - this.offset
	}

	get bufferLeft(): ArrayBuffer {
		return this.buffer.slice(this.offset)
	}

	readBool = (): boolean => {
		return this.readNByteNumber(1) !== 0
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

		this.offset += sz

		return res
	}

	readFloat64 = (): number => {
		const sz = 8
		const slicedBuffer = new Uint8Array(this.buffer.slice(this.offset))

		const buffer = new Uint32Array([0, 0])
		for (let i = 0; i < sz; i++) {
			buffer[i] = slicedBuffer[i]
		}

		const movedBuffer = buffer.buffer // refactor me

		return new Float64Array(movedBuffer)[0]
	}

	readNByteNumber = (sz: 1 | 2 | 4 | 8, unsigned = true): number => {
		const slicedBuffer = new Uint8Array(this.buffer.slice(this.offset))
		let isError = false

		const buffer = new Uint32Array([0, 0])
		for (let i = 0; i < sz; i++) {
			buffer[i] = slicedBuffer[i]
		}

		const movedBuffer = buffer.buffer // refactor me

		try {
			if (unsigned) {
				if (sz === 1) {
					return new Uint8Array(movedBuffer)[0]
				} else if (sz === 2) {
					return new Uint16Array(movedBuffer)[0]
				} else if (sz === 4) {
					return new Uint32Array(movedBuffer)[0]
				} else if (sz === 8) {
					return Number(new BigUint64Array(movedBuffer)[0])
				} else {
					throw new Error(`Invalid unsigned number size ${sz}`)
				}
			} else {
				if (sz === 1) {
					return new Int8Array(movedBuffer)[0]
				} else if (sz === 2) {
					return new Int16Array(movedBuffer)[0]
				} else if (sz === 4) {
					return new Int32Array(movedBuffer)[0]
				} else if (sz === 8) {
					return Number(new BigInt64Array(movedBuffer)[0])
				} else {
					throw new Error(`Invalid signed number size ${sz}`)
				}
			}
		} catch (e) {
			isError = true
			throw e // TODO(teawithsand): refactor me
		} finally {
			if (!isError) {
				this.offset += sz
			}
		}
	}

	advance = (n: number) => {
		this.offset += n
	}
}
