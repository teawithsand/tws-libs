import { ID3Metadata, Metadata } from "../metadata"
import { MetadataLoader } from "./abstract"

import * as jsMediaTags from "@teawithsand/jsmediatags"
import { PlayerSource } from "../../source"

export class DefaultMetadataLoader implements MetadataLoader {
	constructor() {}

	/**
	 * Returns duration in SECONDS NOT MILLIS!
	 */
	private loadDuration = async (
		src: PlayerSource,
		url: string
	): Promise<number | null> => {
		const audio = new Audio()

		let errorListener: () => void
		let metadataListener: () => void
		const p = new Promise<number | null>((resolve, reject) => {
			errorListener = () => {
				reject(
					audio.error ??
						new Error(
							`Unknown error when loading metadata for ${src}`
						)
				)
			}
			metadataListener = () => {
				let duration: number | null = audio.duration * 1000 // to millis
				if (
					duration < 0 ||
					duration > Number.MAX_SAFE_INTEGER ||
					!isFinite(duration) ||
					isNaN(duration)
				)
					duration = null

				resolve(duration)
			}

			audio.addEventListener("error", errorListener)
			audio.addEventListener("stalled", errorListener)
			audio.addEventListener("loadedmetadata", metadataListener)

			const timeout = setTimeout(() => {
				reject(new Error(`Timeout when loading metadata for ${src}`))
			}, 30 * 1000) // 30s is a lot of timeout btw

			try {
				audio.src = url
				audio.preload = "metadata"
				audio.volume = 0
				audio.pause()
				audio.load()
			} finally {
				clearTimeout(timeout)
			}
		}).finally(() => {
			audio.removeEventListener("error", errorListener)
			audio.removeEventListener("loadedmetadata", metadataListener)
		})

		audio.load()

		try {
			return await p
		} finally {
			audio.src = ""
			audio.load()
			audio.pause()
		}
	}

	private loadOtherMetadata = async (src: PlayerSource): Promise<ID3Metadata> => {
		// TODO(teawithsand): custom exception here

		const claim = await src.claimUrl()

		try {
			const blob = await (await fetch(claim.url)).blob()

			const p = new Promise<ID3Metadata>((resolve, reject) => {
				;(jsMediaTags as any).read(blob, {
					onSuccess: (tags: any) => {
						const { artist, year, album, title } = tags.tags
						resolve({
							album: album ?? null,
							artist: artist ?? null,
							title: title ?? null,
							year: parseInt(year ?? "") || null,
						})
					},
					onError: reject,
				})
			})

			const res = await p
			return res
		} finally {
			claim.close()
		}
	}

	loadMetadata = async (src: PlayerSource): Promise<Metadata> => {
		const claim = await src.claimUrl()
		try {
			const duration = await this.loadDuration(src, claim.url)
			const id3 = await this.loadOtherMetadata(src)

			const res = {
				duration,
				...id3,
			}

			return res
		} finally {
			claim.close()
		}
	}
}
