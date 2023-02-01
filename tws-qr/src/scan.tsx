import { generateUUID } from "@teawithsand/tws-stl"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Html5QrcodeError } from "html5-qrcode/esm/core"
import React, {
	CSSProperties,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"

export type QRCodeInnerScanner = Html5QrcodeScanner
export type QRCodeScannerError = Html5QrcodeError

export type QRCodeScannerOnSuccessCallback = (decodedText: string) => void
export type QRCodeScannerOnFailureCallback = (
	errorMessage: string,
	error: QRCodeScannerError
) => void

/**
 * Provides end-to-end working qr code scanner with callbacks and some options.
 *
 * For best display, this element should have width/height set.
 */
export const QRCodeScanner = (props: {
	style?: CSSProperties
	className?: string
	config?: ConstructorParameters<typeof Html5QrcodeScanner>[1]
	verbose?: boolean
	onScanSuccess?: QRCodeScannerOnSuccessCallback
	onScanFailure?: QRCodeScannerOnFailureCallback
}) => {
	const { style, className, config, verbose, onScanFailure, onScanSuccess } =
		props
	const deps = [config, verbose]

	// Regenerate ID once deps change
	// So that we ensure that new scanner will be rendered with new div id
	// If that does not help, we have to await scanner.clear promise.
	// Also making sure that config does not change too often would be useful
	const id = useMemo(() => generateUUID(), [...deps])
	const [_scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)

	const successCallbackRef = useRef<QRCodeScannerOnSuccessCallback | null>(
		null
	)
	const failureCallbackRef = useRef<QRCodeScannerOnFailureCallback | null>(
		null
	)
	// const promiseToAwaitRef = useRef<Promise<void>>(Promise.resolve())

	if (successCallbackRef.current !== onScanSuccess) {
		successCallbackRef.current = onScanSuccess ?? null
	}

	if (failureCallbackRef.current !== onScanFailure) {
		failureCallbackRef.current = onScanFailure ?? null
	}

	useLayoutEffect(() => {
		let scanner: Html5QrcodeScanner | null = null

		const init = () => {
			scanner = new Html5QrcodeScanner(
				id,
				config ?? undefined,
				verbose ?? false
			)
			setScanner(scanner)

			scanner.render(
				(res) => {
					const { current } = successCallbackRef
					if (current) current(res)
				},
				(text, error) => {
					const { current } = failureCallbackRef
					if (current) current(text, error)
				}
			)
		}

		init()

		return () => {
			setScanner(null)
			if (scanner) scanner.clear()
		}
	}, [id, ...deps])

	return <div id={id} style={style} className={className}></div>
}
