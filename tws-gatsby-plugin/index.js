const path = require("path")

const runDotEnv = () => {
	require("dotenv").config({
		path: `.env`,
	})
}

runDotEnv()

const imageBreakpoints = [350, 750, 1080, 1366, 1920]
const imageQuality = 50

const BasicSitePluginsStart = [
	// Styling stuff
	{
		resolve: `gatsby-plugin-styled-components`,
		options: {
			displayName: false,
			fileName: false,
		},
	},
	{
		resolve: "gatsby-plugin-sass",
		options: {
			useResolveUrlLoader: true,
			cssLoaderOptions: {
				// camelCase: true,
				modules: {
					exportLocalsConvention: "camelCaseOnly",
				},
			},
		},
	},

	// Image stuff
	{
		resolve: `gatsby-plugin-sharp`,
		options: {
			defaults: {
				formats: ["jpg", "webp", "avif"],
				placeholder: "blurred",
				quality: imageQuality,
				breakpoints: imageBreakpoints,
				backgroundColor: `transparent`,
			},
		},
	},
	"gatsby-transformer-sharp",
	"gatsby-plugin-image",

	// Misc
	"gatsby-plugin-react-helmet",
	"gatsby-plugin-sitemap",
]

const BasicSitePluginsEnd = [
	// Sources for convention are at the end as well
	{
		resolve: "gatsby-source-filesystem",
		options: {
			name: "images",
			path: "./src/images/",
		},
		__key: "images",
	},
	{
		resolve: "gatsby-source-filesystem",
		options: {
			name: "pages",
			path: "./src/pages/",
		},
		__key: "pages",
	},

	// Compression has to be at the end
	{
		resolve: "gatsby-plugin-zopfli",
		options: {
			extensions: [
				"css",
				"html",
				"js",
				"svg",
				"txt",
				"json",
				"xml",
				"rss",
				"woff",
				"wasm",
			],
			compression: {
				numiterations: 15,
				blocksplitting: true,
				blocksplittingmax: 15,
			},
		},
	},
]

/**
 * Integrates gatsby-plugin-manifest using path to manifest
 */
const makeManifestPlugin = (iconPath, otherOptions = undefined) => ({
	resolve: "gatsby-plugin-manifest",
	options: {
		icon: iconPath,
		...(otherOptions ?? {}),
	},
})

const makeLayoutPlugin = (layoutPath, otherOptions = undefined) => ({
	resolve: "gatsby-plugin-layout",
	options: {
		component: path.resolve(layoutPath),
		...(otherOptions ?? {}),
	},
})

/**
 * Some reasonable defaults to make gatsby-transformer-remark and friends like
 * - gatsby-remark-image
 * - gatsby-remark-copy-linked-files
 * - gatsby-remark-smartypants
 */
const GatsbyTransformerRemarkPlugins = [
	{
		resolve: `gatsby-transformer-remark`,
		options: {
			// extensions: ['.md', '.mdx'],
			plugins: [
				{
					resolve: `gatsby-remark-images`,
					options: {
						srcSetBreakpoints: imageBreakpoints,
						withWebp: true,
						withAvif: true,
						quality: imageQuality,
						showCaptions: true,
						markdownCaptions: true,
						backgroundColor: "transparent",
						maxWidth: 1920,
					},
				},
				{
					resolve: `gatsby-remark-responsive-iframe`,
					options: {
						wrapperStyle: `margin-bottom: 1.0725rem`,
					},
				},
				`gatsby-remark-copy-linked-files`,
				`gatsby-remark-smartypants`,
			],
		},
	},
]

/**
 * Adds gatsby transformer remark with some plugins and ones added by user.
 */
const makeGatsbyTransformerRemarkPlugins = (userPlugins) => [
	{
		resolve: `gatsby-transformer-remark`,
		options: {
			// extensions: ['.md', '.mdx'],
			plugins: [
				{
					resolve: `gatsby-remark-images`,
					options: {
						srcSetBreakpoints: imageBreakpoints,
						withWebp: true,
						withAvif: true,
						quality: imageQuality,
						showCaptions: true,
						markdownCaptions: true,
						backgroundColor: "transparent",
						maxWidth: 1920,
					},
				},
				{
					resolve: `gatsby-remark-responsive-iframe`,
					options: {
						wrapperStyle: `margin-bottom: 1.0725rem`,
					},
				},
				`gatsby-remark-copy-linked-files`,
				`gatsby-remark-smartypants`,
				...(userPlugins ?? []),
			],
		},
	},
]

const mergePlugins = (...configs) => {
	configs = configs.map((c) =>
		c.map((entry) => {
			if (typeof entry === "string") {
				return {
					resolve: entry,
				}
			} else {
				return entry
			}
		})
	)
	let theConfig = [...configs[0]]

	for (const config of configs.slice(1)) {
		let i = 0
		for (const plugin of config) {
			try {
				const currentPluginDefinitionIndex = theConfig.findIndex(
					(currentPlugin) => currentPlugin.resolve === plugin.resolve
				)

				if (
					currentPluginDefinitionIndex >= 0 &&
					!/source/.test(plugin.resolve)
				) {
					theConfig[i] = plugin
				} else {
					theConfig.push(plugin)
				}
			} finally {
				i++
			}
		}
	}

	return theConfig
}

const customizeDefaultPlugins = (...configs) =>
	mergePlugins(BasicSitePluginsStart, ...configs, BasicSitePluginsEnd)

const loadConfig = (require) => {
	const { DEPLOYER_SITE_URL, DEPLOYER_PROJECT_NAME } = process.env

	const obj = {
		DEPLOYER_SITE_URL,
		DEPLOYER_PROJECT_NAME,
	}

	const config = {
		siteUrl: DEPLOYER_SITE_URL,
		projectName: DEPLOYER_PROJECT_NAME,
	}

	if (require) {
		for (const k of Object.keys(obj)) {
			if (!obj[k])
				throw new Error(`loadConfig required, but env var ${k} not set`)
		}
	}

	return config
}

// TODO(teawithsand): sth like https://github.com/gakimball/gatsby-plugin-global-context

const makeConfig = (siteMetadata, plugins) => ({
	flags: {
		DEV_SSR: !!process.env.GATSBY_DEV_SSR,
	},
	siteMetadata: {
		...loadConfig(),
		...siteMetadata,
	},
	// More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
	// If you use VSCode you can also use the GraphQL plugin
	// Learn more at: https://gatsby.dev/graphql-typegen
	graphqlTypegen: true,
	plugins,
	trailingSlash: "never",
})

const makeConfigRequired = (siteMetadata, plugins, options = {}) => {
	const loadedConfig = loadConfig(true)

	options = options ?? {}

	if (!options.allowOverride) {
		for (const k of Object.keys(siteMetadata)) {
			if (k in loadedConfig)
				throw new Error(
					`Tried to override external configuration key ${k}`
				)
		}
	}
	return {
		flags: {
			DEV_SSR: ["yes", "y", "on"].includes(
				(process.env.GATSBY_DEV_SSR || "").toLowerCase().trim()
			),
		},
		siteMetadata: {
			...loadedConfig,
			...siteMetadata,
		},
		// More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
		// If you use VSCode you can also use the GraphQL plugin
		// Learn more at: https://gatsby.dev/graphql-typegen
		graphqlTypegen: true,
		plugins,
		trailingSlash: "never",
	}
}

const makeSelfPlugin = (options) => {
	return {
		resolve: "@teawithsand/tws-gatsby-plugin",
		options,
	}
}

/**
 * Makes offline plugin for gatsby stuff.
 *
 * See https://www.gatsbyjs.com/plugins/gatsby-plugin-offline/ for more info.
 *
 * It also requires `cache_busting_mode: 'none'` in makeManifestPlugin options
 */
const makeOfflinePlugin = (opts) => {
	const config = loadConfig()
	const { cacheId, workboxOptions, options, workboxConfigModifier } = opts

	// regex that matches items which won't have revision in sw.js, as they do not need them
	// Also: these will be stale-while-revalidate for all not-prefetched stuff

	// const cacheBustedRegex = /(\.js$|\.css$|static\/)/
	const cacheBustedRegex = /^\.(js|css)$/ // while static stuff should be static, do not require so yet

	const workboxConfig = {
		importWorkboxFrom: `local`,
		inlineWorkboxRuntime: true,
		cleanupOutdatedCaches: true,
		cacheId: cacheId ?? config.projectName + "/offline-cache",
		// Don't cache-bust JS or CSS files, and anything in the static directory,
		// since these files have unique URLs and their contents will never change
		//
		// Long story short, these files won't have revision included in sw.js
		dontCacheBustURLsMatching: cacheBustedRegex,
		// What to prefetch ie. what resources should be loaded along with any page loaded
		globPatterns: [
			"**/*.{js,css,html,svg}",

			// page-data must be both preloaded, and revisioned in order to allow loading pages
			// not only HTML for each one.
			"page-data/*",
			"page-data/**/*",

			// They *could* be cache busted, but this breaks SW apparently,
			// at least according to gatsby-plugin-offline docs
			"favicon*",
			"icons/**",

			// Note that caching all png/jpg/webp/avif is too risky, since they may be quire big
			// too big for precaching service worker
		],
		// What to ignore from above included lists
		globIgnores: [
			// Some stuff has to be ignored from preloading
			// TODO(teawithsand): adjust cacheBustedRegex to include these
			"**/node_modules/**/*",
		],
		runtimeCaching: [
			{
				// Use cacheFirst since these don't need to be revalidated (same RegExp
				// and same reason as above)
				//
				// Please note, that using this strategy is the same as using network-first one
				// for cache busted resources
				urlPattern: cacheBustedRegex,
				handler: `CacheFirst`,
			},
			{
				// app-data.json/page-data.json(s) files, static query results and app-data.json
				// are not content hashed
				//
				// For latest data, they must be network-first loaded
				urlPattern: /^https?:.*\/page-data\/.*\.json/,
				handler: `NetworkFirst`,
			},
			{
				// Add runtime caching of various other page resources
				// These are not critical and can be stale-while-revalidate
				// Also: most of them is http-cache-busted anyway, so it does not matter that much
				urlPattern:
					/^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|css)$/,
				handler: `StaleWhileRevalidate`,
			},
			{
				// Google Fonts CSS (doesn't end in .css so we need to specify it)
				urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
				handler: `StaleWhileRevalidate`,
			},
		],
		skipWaiting: true,
		clientsClaim: true,
		importWorkboxFrom: `local`,
		...(workboxOptions || {}),
	}

	return {
		resolve: "gatsby-plugin-offline",
		options: {
			// TODO(teawithsand): check if this takes effect if workbox config globs are configured,
			precachePages: ["*", "**/*", "/*"], // AKA precache all stuff
			workboxConfig: workboxConfigModifier
				? workboxConfigModifier(workboxConfig)
				: workboxConfig,
			...(options || {}),
		},
	}
}

module.exports = {
	BasicSitePluginsStart,
	BasicSitePluginsEnd,
	GatsbyTransformerRemarkPlugins,

	makeGatsbyTransformerRemarkPlugins,

	makeSelfPlugin,

	makeManifestPlugin,
	customizeDefaultPlugins,
	mergePlugins,
	makeLayoutPlugin,
	makeOfflinePlugin,

	makeConfig,
	makeConfigRequired,
	loadConfig,
}
