// TODO(teawithsand): rewrite this stuff to singleton

// Hack to workaround utf-8 characters
// TODO(teawithsand): replace it with robust base64 implementation provided by tws-common package
function utf8ToBase64(str: string) {
	return window.btoa(window.unescape(encodeURIComponent(str)))
}

export class DownloadApiHelper {
	private constructor() {}

	private static innerInstance: DownloadApiHelper = new DownloadApiHelper()

	public static get instance() {
		return this.innerInstance
	}

	/**
	 * Requests browser to download whatever data is at specified URL.
	 */
	downloadUrl = (url: string, filename: string) => {
		const a = document.createElement("a")
		a.style.display = "none"
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		setTimeout(() => {
			document.body.removeChild(a)
		}, 5000)
	}

	/**
	 * Requests browser to download specified object to disk.
	 * Object can be anything convertible to URL.
	 */
	downloadObject = (obj: Blob | File | MediaSource, filename: string) => {
		const a = document.createElement("a")
		a.style.display = "none"
		const url = URL.createObjectURL(obj)
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		setTimeout(() => {
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		}, 5000)
	}

	/**
	 * Triggers download of file with specified content, mime and filename.
	 */
	downloadString = (content: string, mime: string, filename: string) => {
		this.downloadUrl(
			`data:${mime};base64,${utf8ToBase64(content)}`,
			filename
		)
	}
}
