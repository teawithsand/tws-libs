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

	private getReadingBuffer = (): [ArrayBuffer, number] => {
		const left = this.bufferLeft
		const sz = Math.min(8, left.byteLength)
		const slicedBuffer = new Uint8Array(left)

		const buffer = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])
		for (let i = 0; i < sz; i++) {
			buffer[i] = slicedBuffer[i]
		}

		return [buffer.buffer.slice(0, sz), sz]
	}

	readFloat64 = (): number => {
		const [ab, sz] = this.getReadingBuffer()
		this.offset += sz

		return new Float64Array(ab)[0]
	}

	readNByteNumber = (sz: 1 | 2 | 4 | 8, unsigned = true): number => {
		const [ab] = this.getReadingBuffer()
		this.offset += sz

		if (unsigned) {
			if (sz === 1) {
				return new Uint8Array(ab)[0]
			} else if (sz === 2) {
				return new Uint16Array(ab)[0]
			} else if (sz === 4) {
				return new Uint32Array(ab)[0]
			} else if (sz === 8) {
				return Number(new BigUint64Array(ab)[0])
			} else {
				throw new Error(`Invalid unsigned number size ${sz}`)
			}
		} else {
			if (sz === 1) {
				return new Int8Array(ab)[0]
			} else if (sz === 2) {
				return new Int16Array(ab)[0]
			} else if (sz === 4) {
				return new Int32Array(ab)[0]
			} else if (sz === 8) {
				return Number(new BigInt64Array(ab)[0])
			} else {
				throw new Error(`Invalid signed number size ${sz}`)
			}
		}
	}

	advance = (n: number) => {
		this.offset += n
	}
}
