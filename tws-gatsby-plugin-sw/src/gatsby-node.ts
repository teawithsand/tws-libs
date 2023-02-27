// use `let` to workaround https://github.com/jhnns/rewire/issues/144

import { getResourcesFromHTML as innerImport } from "./get-resources-from-html"
import { Config, PrecachePageData } from "./types"
/* eslint-disable prefer-const */
let fs = require(`fs`)
let md5 = require("md5")
let workboxBuild = require(`workbox-build`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const glob = require(`glob`)
const _ = require(`lodash`)

let getResourcesFromHTML: (path: string, pathPrefix: string) => string[] =
	innerImport

let s: any
const readStats = () => {
	if (s) {
		return s
	} else {
		s = JSON.parse(
			fs.readFileSync(
				`${process.cwd()}/public/webpack.stats.json`,
				`utf-8`
			)
		)
		return s
	}
}

function getAssetsForChunks(chunks: string[]): string[] {
	const files = _.flatten(
		chunks.map((chunk) => readStats().assetsByChunkName[chunk])
	)
	return _.compact(files)
}

const generateUUID = () => {
	var d = new Date().getTime() //Timestamp
	var d2 =
		(typeof performance !== "undefined" &&
			performance.now &&
			performance.now() * 1000) ||
		0 //Time in microseconds since page-load or 0 if unsupported
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			var r = Math.random() * 16 //random number between 0 and 16
			if (d > 0) {
				//Use timestamp until depleted
				r = (d + r) % 16 | 0
				d = Math.floor(d / 16)
			} else {
				//Use microseconds since page-load if supported
				r = (d2 + r) % 16 | 0
				d2 = Math.floor(d2 / 16)
			}
			return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
		}
	)
}

function getPrecachePages(globs: string[], base: string): string[] {
	const precachePages: string[] = []

	globs.forEach((page) => {
		const matches: string[] = glob.sync(base + page)
		matches.forEach((path) => {
			const isDirectory = fs.lstatSync(path).isDirectory()
			let precachePath: string

			if (isDirectory && fs.existsSync(`${path}/index.html`)) {
				precachePath = `${path}/index.html`
			} else if (path.endsWith(`.html`)) {
				precachePath = path
			} else {
				return
			}

			// Add this check, since glob may match some directories, that do not have index.html inside.
			if (
				!fs.existsSync(precachePath) ||
				!fs.lstatSync(precachePath).isFile()
			) {
				return
			}

			if (precachePages.indexOf(precachePath) === -1) {
				precachePages.push(precachePath)
			}
		})
	})

	return precachePages
}

export const onPostBuild = (
	args: any,
	{
		precachePages: precachePagesGlobs = [],
		appendScript = null,
		debug = undefined,
		makeWorkboxConfig,
	}: Config
) => {
	const { pathPrefix, reporter } = args
	const rootDir = `public`

	// Get exact asset filenames for app and offline app shell chunks
	const files = getAssetsForChunks([`app`, `webpack-runtime`])
	const appFile = files.find((file) => file.startsWith(`app-`))

	const precachePages: string[] = _.uniq([
		...getPrecachePages(precachePagesGlobs, `${process.cwd()}/${rootDir}`),
	])

	const buildId = generateUUID()
	const pages: PrecachePageData[] = precachePages.map((page) => ({
		path:
			page
				.replace("/index.html", "")
				.slice(`${process.cwd()}/${rootDir}`.length) || "/", // TODO(teawithsand): respect trailing slash
		dependencies: getResourcesFromHTML(page, pathPrefix),
		indexHtmlPath: page,
		buildId: buildId,
		indexHtmlHash: md5(fs.readFileSync(page, "utf-8")),
	}))

	const otherGlobPatterns: string[] = []

	const manifests = [`manifest.json`, `manifest.webmanifest`]
	manifests.forEach((file) => {
		if (fs.existsSync(`${rootDir}/${file}`)) otherGlobPatterns.push(file)
	})

	const swDest = `public/sw.js`
	const combinedOptions = makeWorkboxConfig(
		{
			swDest: swDest,
			globDirectory: rootDir,
			globPatterns: otherGlobPatterns,
			modifyURLPrefix: {
				// If `pathPrefix` is configured by user, we should replace
				// the default prefix with `pathPrefix`.
				"/": `${pathPrefix}/`,
			},
			cacheId: `tws-gatsby-plugin-sw`,
			// Don't cache-bust JS or CSS files, and anything in the static directory,
			// since these files have unique URLs and their contents will never change
			dontCacheBustURLsMatching: /(\.js$|\.css$|static\/)/,
			runtimeCaching: [
				// ignore cypress endpoints (only for testing)
				...(process.env.CYPRESS_SUPPORT
					? [
							{
								urlPattern: /\/__cypress\//,
								handler: `NetworkOnly`,
							},
					  ]
					: []),
				{
					// Use cacheFirst since these don't need to be revalidated (same RegExp
					// and same reason as above)
					urlPattern: /(\.js$|\.css$|static\/)/,
					handler: `CacheFirst`,
				},
				{
					// page-data.json files, static query results and app-data.json
					// are not content hashed
					//
					// Make sure they are shipped with their latest versions always
					urlPattern: /^https?:.*\/page-data\/.*\.json/,
					handler: `NetworkFirst`,
				},
				{
					// Add runtime caching of various other page resources
					urlPattern:
						/^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|json|css)$/,
					handler: `StaleWhileRevalidate`,
				},
				{
					// Google Fonts CSS (doesn't end in .css so we need to specify it)
					urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
					handler: `StaleWhileRevalidate`,
				},
			] as any,
			skipWaiting: true,
			clientsClaim: true,
		},
		{
			pages: pages,
			otherFiles: otherGlobPatterns,
		}
	)

	combinedOptions.globPatterns = _.uniq(combinedOptions.globPatterns ?? [])
	combinedOptions.globIgnores = _.uniq(combinedOptions.globIgnores ?? [])

	return workboxBuild
		.generateSW(combinedOptions)
		.then(({ count, size, warnings }: any) => {
			if (warnings)
				warnings.forEach((warning: any) => console.warn(warning))

			if (appendScript !== null) {
				let userAppend
				try {
					userAppend = fs.readFileSync(appendScript, `utf8`)
				} catch (e) {
					throw new Error(
						`Couldn't find the specified offline inject script`
					)
				}
				fs.appendFileSync(`public/sw.js`, `\n` + userAppend)
			}

			reporter.info(
				`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.\n` +
					`The following pages will be precached:\n` +
					precachePages
						.map((path) =>
							path.replace(`${process.cwd()}/public`, ``)
						)
						.join(`\n`)
			)
		})
}
