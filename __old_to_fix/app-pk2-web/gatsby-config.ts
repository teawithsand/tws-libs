import {
	customizeDefaultPlugins,
	makeConfig,
	makeSelfPlugin,
} from "@teawithsand/tws-gatsby-plugin"

const plugins = customizeDefaultPlugins(
	[
		// makeManifestPlugin("./src/images/icon.png"),
		// makeLayoutPlugin("./src/Layout.jsx"),
	],
	[
		makeSelfPlugin({
			languages: ["en-US"],
		}),
	],
	[
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "resources",
				path: "./res/",
			},
			__key: "resources",
		},
	]
)

const config = makeConfig(
	{
		siteUrl: `https://pk2.teawithsand.com`,
	},
	plugins,
)

export default config
