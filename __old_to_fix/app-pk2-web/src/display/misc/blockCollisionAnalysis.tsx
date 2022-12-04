import { throwExpression } from "@teawithsand/tws-stl"
import React, { useEffect, useRef, useState } from "react"

import { computeRawBlockCollisions } from "@app/game/map/collision"

const image = `
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAXVBMVEWU0d4AAAAzMjpPWExd
d1dESEc/QEMoKDBaZ1FniFZ7oGIWDCIjGiYJAQcRAhQwBBVFBRwiAhBUBhoBAQtjESRyGiyUMD3G
VESnN0WGJjW6RkDoc0LYZUTsdkr///9MgWCFAAAAAXRSTlMAQObYZgAAAAFiS0dEHnIKICsAAAAH
dElNRQfmCgsUBwDFFlD0AAAAEGNhTnYAAAFAAAAB4AAAAKAAAAAA1mciMgAAAYxJREFUOMuFkduS
5CAIQBEUnE120p0VvCT7/7+52F3zMDt9oSplKYejEAhvAgJSTJxYYqYPihRzokREmVKklBII+lGM
lH95Nqfsu8yei86kmCOEQMSzlF3AfK9lZ3nuYgYICf3wY1YnTH5bzCwuvzkiO4ASKHvSH4LES4pp
FeabkGiZwDpv4d/+IeNKST593Vx4wbTeDSwoVxdceZEk8imM+xQK/pkATon4KrzJKsu6CV439+0r
XhyQEHAOxC1YFtkWUdmLIm/qBw6sngSY5CLluu+Cuhervhii3gxwjyDaLhdCtL2PKmpNxeY5fEUo
g33MciDXs9uotg74FqEYUVuPyja61dFvhm9Eqq3Jcbau3Zr18j8Awcaw0VIpRVtr2uAH0V2e55C6
Wes/AQiqibxc1duwB4CPlkv3iyZhBo+IzdpoDvSuCg8J9bz3McajN9xf6g1oO+s44Amh3kAdrZ7w
jNjtOMdZKzwl9DwOvwOeE+38e4wGLwg7/cfAS6LZgJdEsZeGW7fwjoB3xD8lmRkJrc+5jQAAACV0
RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMC0xMVQyMDowNjo1OSswMDowMF9tMbsAAAAldEVYdGRhdGU6
bW9kaWZ5ADIwMjItMTAtMTFUMjA6MDY6NTkrMDA6MDAuMIkHAAAAAElFTkSuQmCC`
	.trim()
	.replace("\n", "")
	.trim()

const imageUrl = "data:image/png;base64," + image

export const BlockCollisionAnalysis = (props: {}) => {
	const [collisions, setRes] = useState<boolean[][] | null>(null)
	const [canvas, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
	useEffect(() => {
		const f = async () => {
			setRes(await computeRawBlockCollisions(imageUrl))
		}

		f()
	}, [setRes])

	const f = async () => {
		if (!canvas || !collisions) return

		const ctx =
			canvas.getContext("2d") ??
			throwExpression(
				new Error("Unexpected canvas context obtaining failure"),
			)

		ctx.globalCompositeOperation = "copy"
		ctx.imageSmoothingEnabled = false

		document.body.style.backgroundColor = "blue"
		ctx.fillStyle = "white"
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		const data = ctx.getImageData(0, 0, canvas.width, canvas.height)

		for (let y = 0; y < collisions.length; y++) {
			for (let x = 0; x < collisions[y].length; x++) {
				const idx = (x + y * canvas.width) * 4

				const v = collisions[x][y] ? 255 : 0

				data.data[idx + 0] = v
				data.data[idx + 1] = v
				data.data[idx + 2] = v
				data.data[idx + 3] = 255
			}
		}

		ctx.putImageData(data, 0, 0)
	}

	useEffect(() => {
		f()
	}, [collisions, canvas])

	return (
		<>
			<img
				src={imageUrl}
				style={{
					imageRendering: "pixelated",

					width: `${32 * 10}px`,
					height: `${32 * 10}px`,
				}}
			/>
			<canvas
				width={32}
				height={32}
				style={{
					imageRendering: "pixelated",

					width: `${32 * 10}px`,
					height: `${32 * 10}px`,
				}}
				ref={setCanvasRef}
			></canvas>
		</>
	)
}
