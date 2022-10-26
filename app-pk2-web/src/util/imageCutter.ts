import { Rect } from "@app/util/geometry"

export class ImageCutter {
	private constructor(
		private readonly imageData: Uint8ClampedArray,
		private readonly width: number,
		private readonly height: number,
	) {}

	static loadImage = async (url: string, w: number, h: number) => {
		const img = new Image()
		img.width = w
		img.height = h
		img.loading = "eager"

		const p = new Promise((resolve, reject) => {
			img.src = url
			img.onerror = e => reject(e)
			img.onload = () => resolve(img)
		})

		await p

		const canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		canvas.style.imageRendering = "pixelated"
		canvas.style.display = "none"

		document.body.appendChild(canvas)
		try {
			const ctx = canvas.getContext("2d")
			if (!ctx) throw new Error("Filed to obtain 2d canvas context")

			ctx.globalCompositeOperation = "copy"
			ctx.imageSmoothingEnabled = false

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

			const imageData = ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height,
			)

			return new ImageCutter(imageData.data, canvas.width, canvas.height)
		} finally {
			document.body.removeChild(canvas)
		}
	}

	drawFragment = (
		ctx: CanvasRenderingContext2D,
		bufWidth: number,
		bufHeight: number,
		r: Rect,
	) => {
		r = r.normalized
		const destinationBuffer = ctx.getImageData(0, 0, bufWidth, bufHeight)

		for (let x = 0; x < r.width; x++) {
			for (let y = 0; y < r.height; y++) {
				for (let i = 0; i < 4; i++) {
					destinationBuffer.data[
						(y * destinationBuffer.width + x) * 4 + i
					] =
						this.imageData[
							(this.width * (r.p1.y + y) + r.p1.x + x) * 4 + i
						]
				}
			}
		}

		ctx.putImageData(destinationBuffer, 0, 0)
	}
}
