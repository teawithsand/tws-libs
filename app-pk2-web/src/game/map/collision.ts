/**
 * Value is true, where terrain exists. It's false otherwise.
 */
export const analyzeGraphicsCollision = async (
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
