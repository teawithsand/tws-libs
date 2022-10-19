import { BlockCollisionData } from "@app/game/map/defines"

/**
 * Value is true, where terrain exists. It's false otherwise.
 */
export const computeRawBlockCollisions = async (
	url: string,
): Promise<boolean[][]> => {
	const img = new Image()
	img.style.imageRendering = "pixelated"
	const p = new Promise<void>((resolve, reject) => {
		img.addEventListener("error", e => {
			reject(e)
		})
		img.addEventListener("load", () => {
			resolve()
		})
	})
	img.width = 32
	img.height = 32
	img.src = url
	img.loading = "eager"

	await p

	const canvas = document.createElement("canvas")
	canvas.width = 32
	canvas.height = 32
	canvas.style.imageRendering = "pixelated"
	canvas.style.display = "none"

	document.body.appendChild(canvas)
	try {
		const ctx = canvas.getContext("2d")
		if (!ctx) throw new Error("Filed to obtain 2d canvas context")

		ctx.globalCompositeOperation = "copy"
		ctx.imageSmoothingEnabled = false

		ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

		const data = ctx.getImageData(0, 0, canvas.width, canvas.height, {
			colorSpace: "srgb",
		})

		const res: boolean[][] = []

		for (let i = 0; i < canvas.height; i++) {
			res.push(new Array(canvas.width).fill(false))
		}

		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const idx = (x + y * canvas.width) * 4

				const alpha = data.data[idx + 3]
				res[x][y] = alpha !== 255
			}
		}

		return res
	} finally {
		document.body.removeChild(canvas)
	}
}

export const computeBlockCollisionData = (
	rawBlockCollisions: boolean[][],
): BlockCollisionData => {
	// this could be bin search btw on assumption that blocks aren't holey
	const rays = (
		iteratorFactory: (i: number) => Iterable<boolean>,
		reverse = false,
	) => {
		const sz = rawBlockCollisions.length

		const res = []
		outer: for (let i = 0; i < sz; i++) {
			const it = iteratorFactory(i)

			let j = 0
			for (const e of it) {
				if (e === true) {
					res.push(reverse ? sz - j - 1 : j)
					continue outer
				}
				j++
			}

			res.push(-1)
		}

		return res
	}

	const topRay = rays(function* (i: number) {
		for (const v of rawBlockCollisions[i]) yield v
	})
	const bottomRay = rays(function* (i: number) {
		for (const v of [...rawBlockCollisions[i]].reverse()) yield v
	})
	const leftRay = rays(function* (i: number) {
		for (const v of rawBlockCollisions) yield v[i]
	})
	const rightRay = rays(function* (i: number) {
		for (const v of [...rawBlockCollisions].reverse()) yield v[i]
	})

	return {
		raw: rawBlockCollisions,
		topRay,
		bottomRay,
		leftRay,
		rightRay,
	}
}
