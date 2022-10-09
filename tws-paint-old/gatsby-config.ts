import {
	customizeDefaultPlugins,
	makeConfig,
	makeLayoutPlugin,
	makeManifestPlugin,
	makeSelfPlugin,
} from "@teawithsand/tws-gatsby-plugin"

const plugins = customizeDefaultPlugins(
	[
		makeManifestPlugin("./src/images/icon.png"),
		makeLayoutPlugin("./src/Layout.jsx"),
	],
	[
		makeSelfPlugin({
			languages: [],
		}),
	],
)

const config = makeConfig(
	{
		siteUrl: `https://paint.teawithsand.com`,
	},
	plugins,
)

export default config
