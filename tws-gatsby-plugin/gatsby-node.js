const TSConfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const path = require("path")
const { exists, writeFile, ensureDir } = require("fs")
const { resolve } = require("path")

const { loadConfig } = require("./index")

function getMetaRedirect(toPath) {
	let url = toPath.trim()

	const hasProtocol = url.includes("://")
	if (!hasProtocol) {
		const hasLeadingSlash = url.startsWith("/")
		if (!hasLeadingSlash) {
			url = `/${url}`
		}

		const resemblesFile = url.includes(".")
		if (!resemblesFile) {
			url = `${url}/`.replace(/\/\/+/g, "/")
		}
	}

	return `<meta http-equiv="refresh" content="0; URL='${url}'" />`
}

// TODO(teawithsand): reenable it, so redirects will still work
async function writeRedirectsFiles(redirects, folder, pathPrefix) {
	return

	for (const redirect of redirects) {
		const { fromPath, toPath } = redirect

		const FILE_PATH = folder.endsWith(".html")
			? folder
			: path.join(folder, fromPath.replace(pathPrefix, ""), "index.html")

		const fileExists = await new Promise((resolve, reject) => {
			try {
				exists(FILE_PATH, (exists) => resolve(exists))
			} catch (e) {
				reject(e)
			}
		})
		if (!fileExists) {
			try {
				await ensureDir(path.dirname(FILE_PATH))
			} catch (err) {
				// ignore if the directory already exists;
			}

			const data = getMetaRedirect(toPath)
			await new Promise((resolve, reject) => {
				writeFile(FILE_PATH, data, (err) => {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				})
			})
		}
	}
}

const onCreatePage = async ({ page, actions }, config) => {
	let languages = []
	let pageFilter = null
	let defaultLanguage = null
	if (config) {
		languages = config.languages ?? []
		if (languages.length === 0) throw new Error("no langs killer")
		pageFilter = config.pageFilter ?? null
		defaultLanguage = config.defaultLanguage ?? languages[0]

		if (!languages.includes(defaultLanguage)) {
			throw new Error(
				`Default language ${defaultLanguage} not in languages: ${languages.join(
					", "
				)}`
			)
		}
	}

	if (!pageFilter) {
		/*
		// quite rudimentary, but should do.
		pageFilter = path => {
			const innerLangs = languages.map(v => v.toLowerCase())
			for (const l of innerLangs) {
				if (path.startsWith("/" + l + "/")) return false
			}
			return true
		}
		*/
		pageFilter = () => true
	}

	const { createPage, deletePage, createRedirect } = actions

	if (!pageFilter(page.path)) return

	// If page already has a language, then skip it as it's already internationalized.
	if (page.context.language !== undefined) return

	if (page.path.match(/\/404\//)) {
		// TODO(teawithsand): statically internationalized 404 pages (requires nginx cooperation).
		//  For it's NIY as they aren't as important for SEO.
		return
	}

	// Make page with no link so far contain
	deletePage(page)
	createPage({
		...page,
		context: {
			...page.context,
			language: defaultLanguage,
		},
	})

	createRedirect({
		fromPath: "/" + defaultLanguage.toLowerCase() + page.path,
		toPath: page.path,
		isPermanent: true,
	})

	languages.forEach((lang) => {
		if (lang === defaultLanguage) return
		const newPage = {
			...page,
			path: "/" + lang.toLowerCase() + page.path,
			context: {
				...page.context,
				language: lang,
			},
		}

		createPage(newPage)
	})
}

const onCreateWebpackConfig = ({
	actions,
	plugins,
	getConfig,
	rules,
	stage,
	loaders,
}) => {
	const config = getConfig()
	const imgsRule = rules.images()

	config.plugins = [...(config.plugins ?? [])]

	const newUrlLoaderRule = {
		...imgsRule,
		test: new RegExp(
			imgsRule.test.toString().replace("svg|", "").slice(1, -1)
		),
	}

	config.module.rules = [
		...(config.module.rules ?? []).filter((rule) => {
			if (rule.test) {
				return rule.test.toString() !== imgsRule.test.toString()
			}
			return true
		}),
		{
			test: /.svg$/,
			use: ["@svgr/webpack"],
		},
		newUrlLoaderRule,
	]

	/*
	config.module.rules = [
		...config.module.rules,
		{
			test: /.apk$/i,
			type: "asset/resource",
		},
	]
	*/
	config.resolve.plugins = [
		...(config.resolve.plugins ?? []),
		new TSConfigPathsPlugin(),
	]

	// Required to make yarn link work
	// Also required for yarn's link:... dependencies
	config.resolve.symlinks = false

	if (config.mode === "production") {
		config.devtool = false
	}

	if (stage === "build-javascript") {
		config.output = {
			...config.output,
			filename: `[contenthash].js`,
			chunkFilename: `[contenthash].js`,
		}
		actions.replaceWebpackConfig(config)
	} else {
		actions.replaceWebpackConfig(config)
	}

	if (stage === "build-html" || stage === "develop-html") {
		config.module = config.module ?? {}
		config.module.rules = config.module.rules ?? []
	}

	const exportedVariablesObject = loadConfig(false)

	let res = {}
	for (const k in exportedVariablesObject) {
		res[`process.env.${k}`] = JSON.stringify(exportedVariablesObject[k])
	}

	if (Object.keys(res).length) {
		config.plugins = [...config.plugins, plugins.define(res)]
	}

	if (stage === "build-html" || stage === "develop-html") {
		config.module.rules = [
			...(config.module.rules ?? []),
			{
				// peerjs say version 1.4.7 references global navigator on import, which is no-no in gatsby's world
				test: /peerjs/,
				use: loaders.null(),
			},
		]
	}

	actions.replaceWebpackConfig(config)
}

const onPostBuild = ({ store }) => {
	const { redirects, program, config } = store.getState()

	let pathPrefix = ""
	if (program.prefixPaths) {
		pathPrefix = config.pathPrefix
	}

	const folder = path.join(program.directory, "public")
	return writeRedirectsFiles(redirects, folder, pathPrefix)
}

module.exports = { onCreateWebpackConfig, onCreatePage, onPostBuild }
