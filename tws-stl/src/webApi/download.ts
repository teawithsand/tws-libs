// TODO(teawithsand): rewrite this stuff to singleton

import { generateUUID, latePromise, simpleSleep } from "../lang"

// Hack to workaround utf-8 characters
// TODO(teawithsand): replace it with robust base64 implementation provided by tws-common package
function utf8ToBase64(str: string) {
	return btoa(unescape(encodeURIComponent(str)))
}

export interface MultipleDownloadApiHelperSaver {
	download: () => Promise<void>
}

export interface DownloadApiHelperSaver {
	download: (filename: string) => Promise<void>
	open: () => Promise<void>
}

// TODO(teawithsand): implement this to DownloadApiHelper
export interface ExtendedDownloadApiHelperSaver extends DownloadApiHelperSaver {
	readonly isSaveAsSupported: boolean
	save: (filename: string) => void
}

const isSaveAsSupported =
	typeof window !== "undefined" && "showSaveFilePicker" in window

export enum DownloadableEntryType {
	BLOB = 1,
	TEXT = 2,
	URL = 3,
}

export type PartialDownloadableEntry =
	| {
			type: DownloadableEntryType.BLOB
			blob: Blob
	  }
	| {
			type: DownloadableEntryType.URL
			url: string
	  }
	| {
			type: DownloadableEntryType.TEXT
			text: string
			mime: string
	  }

export type DownloadableEntry = {
	filename: string
} & PartialDownloadableEntry

const LINK_EXISTENCE_MS = 4000

export class DownloadApiHelper {
	private constructor() {}

	private static innerInstance: DownloadApiHelper = new DownloadApiHelper()

	public static get instance() {
		return this.innerInstance
	}

	private runSaveAsOnEntry = async (entry: DownloadableEntry) => {
		if (!isSaveAsSupported) return
		const id = generateUUID()
		const handle = await (window as any).showSaveFilePicker({
			suggestedName: entry.filename,
			id,
			types: {
				description: `File: ${entry.filename}`,
				accept: {},
			},
		})

		const writable = await handle.createWritable()
		if (entry.type === DownloadableEntryType.BLOB) {
			await writable.write(entry.blob)
		} else if (entry.type === DownloadableEntryType.TEXT) {
			const enc = new window.TextEncoder()
			const res = enc.encode(entry.text)
			const file = new File([res], entry.filename, {
				type: entry.mime,
			})
			await writable.write(file)
		} else if (entry.type === DownloadableEntryType.URL) {
			const res = await fetch(entry.url)
			const blob = await res.blob()
			await writable.write(blob)
		}
		await writable.close()
	}

	private runDownloadOnEntry = (entry: DownloadableEntry) => {
		const [p, resolve] = latePromise<void>()

		const a = document.createElement("a")
		a.style.display = "none"
		a.rel = "noopener noreferrer"

		let url = ""
		let releaser = () => {}
		if (entry.type === DownloadableEntryType.BLOB) {
			url = URL.createObjectURL(entry.blob)
			releaser = () => {
				URL.revokeObjectURL(url)
			}
		} else if (entry.type === DownloadableEntryType.TEXT) {
			url = `data:${entry.mime};base64,${utf8ToBase64(entry.text)}`
		} else if (entry.type === DownloadableEntryType.URL) {
			url = entry.url
		}

		a.href = url
		a.download = entry.filename
		document.body.appendChild(a)

		a.click()

		setTimeout(() => {
			document.body.removeChild(a)
			releaser()

			resolve()
		}, LINK_EXISTENCE_MS)

		return p
	}

	private runOpenOnEntry = (entry: PartialDownloadableEntry) => {
		const [p, resolve] = latePromise<void>()
		const a = document.createElement("a")
		a.style.display = "none"
		a.rel = "noopener noreferrer"

		let url = ""
		let releaser = () => {}
		if (entry.type === DownloadableEntryType.BLOB) {
			url = URL.createObjectURL(entry.blob)
			releaser = () => {
				URL.revokeObjectURL(url)
			}
		} else if (entry.type === DownloadableEntryType.TEXT) {
			url = `data:${entry.mime};base64,${utf8ToBase64(entry.text)}`
		} else if (entry.type === DownloadableEntryType.URL) {
			url = entry.url
		}

		a.href = url
		a.target = "_blank"
		document.body.appendChild(a)

		a.click()

		setTimeout(() => {
			document.body.removeChild(a)
			releaser()
			resolve()
		}, LINK_EXISTENCE_MS)

		return p
	}

	entries = (
		entries: DownloadableEntry[]
	): MultipleDownloadApiHelperSaver => {
		return {
			download: async () => {
				let promises = []
				for (const entry of entries) {
					promises.push(this.runDownloadOnEntry(entry))
					await simpleSleep(100) // add some delay between download calls 10 files per second should be ok
				}

				await Promise.all(promises)
			},
		}
	}

	text = (text: string, mime: string): ExtendedDownloadApiHelperSaver => {
		return {
			isSaveAsSupported,
			download: async (filename) => {
				await this.runDownloadOnEntry({
					filename,
					type: DownloadableEntryType.TEXT,
					text,
					mime,
				})
			},
			open: async () => {
				await this.runOpenOnEntry({
					type: DownloadableEntryType.TEXT,
					text,
					mime,
				})
			},
			save: async (filename) => {
				await this.runSaveAsOnEntry({
					filename,
					type: DownloadableEntryType.TEXT,
					text,
					mime,
				})
			},
		}
	}

	blob = (blob: Blob): ExtendedDownloadApiHelperSaver => {
		return {
			isSaveAsSupported,
			download: async (filename) => {
				await this.runDownloadOnEntry({
					filename,
					type: DownloadableEntryType.BLOB,
					blob,
				})
			},
			open: async () => {
				await this.runOpenOnEntry({
					type: DownloadableEntryType.BLOB,
					blob,
				})
			},
			save: async (filename) => {
				await this.runSaveAsOnEntry({
					filename,
					type: DownloadableEntryType.BLOB,
					blob,
				})
			},
		}
	}

	/**
	 * Note: save method as well as download one works only on local urls(SORP ones).
	 */
	url = (url: string): ExtendedDownloadApiHelperSaver => {
		return {
			isSaveAsSupported,
			download: async (filename) => {
				await this.runDownloadOnEntry({
					filename,
					type: DownloadableEntryType.URL,
					url,
				})
			},
			open: async () => {
				await this.runOpenOnEntry({
					type: DownloadableEntryType.URL,
					url,
				})
			},
			save: async (filename) => {
				await this.runSaveAsOnEntry({
					filename,
					type: DownloadableEntryType.URL,
					url,
				})
			},
		}
	}

	/**
	 * Requests browser to download whatever data is at specified URL.
	 *
	 * Does not work with remote urls.
	 * 
	 * @deprecated use new builder-based design instead
	 */
	downloadUrl = (url: string, filename: string) => {
		const a = document.createElement("a")
		a.rel = "noopener noreferrer"
		a.style.display = "none"
		
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		setTimeout(() => {
			document.body.removeChild(a)
		}, LINK_EXISTENCE_MS)
	}

	/**
	 * Requests browser to download specified object to disk.
	 * Object can be anything convertible to URL.
	 *
	 * @deprecated use new builder-based design instead
	 */
	downloadObject = (obj: Blob | File, filename: string) => {
		const a = document.createElement("a")
		a.rel = "noopener noreferrer"
		a.style.display = "none"

		const url = URL.createObjectURL(obj)
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		setTimeout(() => {
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		}, LINK_EXISTENCE_MS)
	}

	/**
	 * Triggers download of file with specified content, mime and filename.
	 *
	 * @deprecated use new builder-based design instead
	 */
	downloadString = (content: string, mime: string, filename: string) => {
		this.downloadUrl(
			`data:${mime};base64,${utf8ToBase64(content)}`,
			filename
		)
	}
}
