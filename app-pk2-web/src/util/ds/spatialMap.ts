import { generateUUID, throwExpression } from "@teawithsand/tws-stl"

import { Rect } from "@app/util/geometry"

export interface SpatialHashMapClient<T> {
	readonly data: T
	readonly rect: Rect

	setRect(r: Rect): void
	release(): void
}

type Entry<T> = {
	data: T
	rect: Rect
}

/**
 * Loose data structure, which:
 * 1. Always returns entries that could collide with given rectangle.
 * 2. Not all of yielded results *must* collide with given rectangle.
 *
 * This DS supports client, which supports moving it's entries.
 */
export class SpatialHashMap<T> {
	private map: Map<number, Set<string>> = new Map()
	private clientMap: Map<string, Entry<T>> = new Map()

	constructor(public readonly cellW: number, public readonly cellH: number) {}

	private cellKeyFromIndexes = (x: number, y: number) => {
		if (y > 2 ** 16 - 1 || x > 2 ** 16 - 1)
			throw new Error("Cell out of range")

		return x && 0xffff | ((y & 0xffff) << 16) // Result of BW ops is 32 bit int in JS, so this is ok
	}
	private cellEntry = (x: number, y: number) => {
		const cellIndexX = Math.floor(x / this.cellW)
		const cellIndexY = Math.floor(y / this.cellH)
		const cellKey = this.cellKeyFromIndexes(cellIndexX, cellIndexY)

		return {
			has: (id: string) => {
				const s = this.map.get(cellKey) ?? new Set()

				return s.has(id)
			},
			get: () => {
				return this.map.get(cellKey) ?? new Set()
			},
			addId: (id: string): void => {
				const s = this.map.get(cellKey) ?? new Set()
				s.add(id)
				this.map.set(cellKey, s)
			},
			rmId: (id: string): void => {
				const s = this.map.get(cellKey) ?? new Set()
				s.delete(id)
				if (!s.size) this.map.delete(cellKey)
				else this.map.set(cellKey, s)
			},
		}
	}

	private walkCells = (r: Rect) => {
		const [sx, sy] = r.normalized.p1.toArray()
		const [ex, ey] = r.normalized.p2.toArray()
		const { cellW, cellH } = this
		function* walker() {
			for (let x = sx; x <= ex; x += cellW) {
				for (let y = sy; y <= ey; y += cellH) {
					yield [x, y]
				}
			}

			yield [ex, ey]
		}

		return walker()
	}

	private claimRect = (
		r: Rect,
		id: string,
		claimIfTrueElseUnclaim = true,
	) => {
		for (const [x, y] of this.walkCells(r)) {
			const cellOp = this.cellEntry(x, y)

			if (claimIfTrueElseUnclaim) {
				cellOp.addId(id)
			} else {
				cellOp.rmId(id)
			}
		}
	}

	getIntersectingValues = (rect: Rect): Array<T> => {
		let testRect = rect.normalized

		// These checks are used to enforce that cells to the left/top will
		// be tested for points that are on the edge
		if (testRect.p1.x % this.cellW === 0) {
			const [x1, y1, x2, y2] = testRect.toArray()
			testRect = new Rect([x1 - 1, y1, x2, y2]).normalized
		}

		if (testRect.p1.y % this.cellH === 0) {
			const [x1, y1, x2, y2] = testRect.toArray()
			testRect = new Rect([x1, y1 - 1, x2, y2]).normalized
		}

		new Rect([
			[0, 0],
			[2 ** 16 - 1 * this.cellW, 2 ** 16 - 1 * this.cellH],
		]).intersection(rect)?.normalized

		if (!testRect) return []

		const ids = new Set<string>()

		for (const [x, y] of this.walkCells(testRect)) {
			const cellOp = this.cellEntry(x, y)
			for (const id of cellOp.get().values()) {
				const v =
					this.clientMap.get(id) ??
					throwExpression(new Error("Unreachable code"))

				if (rect.intersection(v.rect) !== null) ids.add(id)
			}
		}

		return [...ids.values()]
			.map(
				id =>
					this.clientMap.get(id) ??
					throwExpression(new Error("Unreachable code")),
			)
			.map(v => v.data)
	}

	newClient = (data: T, currentRect: Rect): SpatialHashMapClient<T> => {
		const cid = generateUUID()
		let isReleased = false

		this.clientMap.set(cid, {
			data,
			rect: currentRect,
		})
		this.claimRect(currentRect, cid, true)

		return {
			data,
			get rect() {
				return currentRect
			},
			setRect: newRect => {
				if (isReleased) return

				this.claimRect(currentRect, cid, false)
				this.claimRect(newRect, cid, true)
				currentRect = newRect

				const v = this.clientMap.get(cid)
				if (v) v.rect = currentRect
			},
			release: () => {
				if (!isReleased) {
					isReleased = true
					this.claimRect(currentRect, cid, false)
					this.clientMap.delete(cid)
				}
			},
		}
	}
}
