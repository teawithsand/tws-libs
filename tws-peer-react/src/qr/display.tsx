import { makeQrCode, QRCodeOptions } from "@teawithsand/tws-peer"
import React, { useEffect, useState } from "react"

/**
 * Element, which draws QR code on canvas.
 * Automatically updates canvas if QR changes.
 */
export const QRCodeDisplay = (props: {
	width: number
	height: number
	data: string
	options?: QRCodeOptions
	style?: React.CSSProperties
	className?: string
}) => {
	const { width, height, style, className, data: text, options } = props
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

	useEffect(() => {
		if (canvas) {
			const ctx = canvas.getContext("2d")
			if (ctx) {
                // Reset canvas
				ctx.strokeStyle = "#FFFFFF"
				ctx.rect(0, 0, width, height)
			}
			makeQrCode(text, options).drawToCanvas(canvas)
		}
	}, [canvas, text, options, width, height])

	return (
		<canvas
			width={width}
			height={height}
			style={style}
			className={className}
			ref={setCanvas}
		/>
	)
}
