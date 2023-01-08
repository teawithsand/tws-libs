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

	makeExposeConfigGloballyPlugin,
	makeConfig,
	makeConfigRequired,
	loadConfig,
}
