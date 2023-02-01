import { QRCodeErrorCorrectionLevel } from "qrcode"
import React, { useEffect, useState } from "react"
import { makeQrCode } from "./qr"

/**
 * Element, which draws QR code on canvas.
 * Automatically updates canvas if QR changes.
 */
export const QRCodeDisplay = (props: {
	width: number
	height: number
	data: string
	errorCorrectionLevel?: QRCodeErrorCorrectionLevel
	style?: React.CSSProperties
	className?: string
}) => {
	const {
		width,
		height,
		style,
		className,
		data: text,
		errorCorrectionLevel,
	} = props
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

	// TODO(teawithsand): should this be useLayoutEffect?
	//  It does not do any measurements(except canvas width/height), but it's ok I guess.
	
	useEffect(() => {
		if (canvas) {
			const ctx = canvas.getContext("2d")
			if (ctx) {
				// Reset canvas
				ctx.strokeStyle = "#FFFFFF"
				ctx.rect(0, 0, width, height)
			}
			makeQrCode(
				text,
				errorCorrectionLevel
					? {
							errorCorrectionLevel,
							width: canvas.width,
							height: canvas.height,
					  }
					: undefined
			).drawToCanvas(canvas)
		}
	}, [canvas, text, errorCorrectionLevel, width, height])

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
