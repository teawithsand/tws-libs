import { generateUUID } from "@teawithsand/tws-stl"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Html5QrcodeError } from "html5-qrcode/esm/core"
import React, { CSSProperties, useLayoutEffect, useMemo, useState } from "react"

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
	onScanSuccess?: (decodedText: string) => void
	onScanFailure?: (errorMessage: string, error: Html5QrcodeError) => void
}) => {
	const id = useMemo(() => generateUUID(), [])
	const [_scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)

	useLayoutEffect(() => {
		const scanner = new Html5QrcodeScanner(id, props.config, props.verbose)
		setScanner(scanner)

		scanner.render(
			props.onScanSuccess ?? (() => {}),
			props.onScanFailure ?? (() => {})
		)

		return () => {
			scanner.clear()
		}
	}, [
		id,
		props.config,
		props.verbose,
		props.onScanFailure,
		props.onScanSuccess,
	])

	return <div id={id} style={props.style} className={props.className}></div>
}
