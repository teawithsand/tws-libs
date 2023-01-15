import { throwExpression } from "@teawithsand/tws-stl"
import { QRCodeErrorCorrectionLevel, toCanvas } from "qrcode"

export interface QRCodeOptions {
	width: number
	height: number
	errorCorrectionLevel: QRCodeErrorCorrectionLevel
}

export const DEFAULT_QR_CODE_OPTIONS: QRCodeOptions = {
	height: 400,
	width: 400,
	errorCorrectionLevel: "Q", // approx. 25% of QR may be decoded wrong with this setting.
}

export interface QRCodeFactory {
	readonly data: string
	readonly options: Readonly<QRCodeOptions>

	dataUrl: (type?: string, quality?: number) => string
	imageData: () => ImageData
	drawToCanvas: (canvas: HTMLCanvasElement) => void
}

export const makeQrCode = (
	data: string,
	options: QRCodeOptions = DEFAULT_QR_CODE_OPTIONS
): QRCodeFactory => {
	const operate = <T>(
		onDrawnOnCanvas: (canvas: HTMLCanvasElement) => T
	): T => {
		if (typeof document === "undefined")
			throw new Error(
				"tws-peer can't create qr codes on node right now, as it uses " +
					"document.createElement in order to create canvas that QR will be drawn to."
			)
			
		const canvas = document.createElement("canvas")
		canvas.style.display = "none"
		canvas.width = options.width
		canvas.height = options.height

		document.body.appendChild(canvas)

		try {
			toCanvas(canvas, data, {
				errorCorrectionLevel: options.errorCorrectionLevel,
				width: Math.min(canvas.height, canvas.width),
			})
			return onDrawnOnCanvas(canvas)
		} finally {
			document.body.removeChild(canvas)
		}
	}
	const res: QRCodeFactory = {
		options,
		data,
		dataUrl: (type?: string, quality?: number) =>
			operate((canvas) => {
				return canvas.toDataURL(type, quality)
			}),
		imageData: () =>
			operate((canvas) => {
				const ctx =
					canvas.getContext("2d") ??
					throwExpression(new Error("can't obtain 2d canvas context"))
				return ctx.getImageData(0, 0, canvas.width, canvas.height)
			}),
		drawToCanvas: (canvas) => {
			toCanvas(canvas, data, {
				errorCorrectionLevel: options.errorCorrectionLevel,
				width: Math.min(canvas.height, canvas.width),
			})
		},
	}

	return Object.freeze(res)
}
