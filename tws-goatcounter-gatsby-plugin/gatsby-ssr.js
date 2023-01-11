const React = require("react")

/**
 * @param {PluginConfig} options
 */
exports.onRenderBody = (
	{ reporter, setPostBodyComponents, pathname },
	options = {}
) => {
	const scriptPath =
		options.scriptPath ??
		reporter.error(
			`scriptPath used to load goatcounter script is required.`
		)
	const countEndpoint =
		options.countEndpoint ??
		reporter.error(
			`countEndpoint used to specify where data should land is required.`
		)
	let settings = options.scriptTagSettings

	const opts = { pathname }

	if (typeof settings === "function") {
		settings = settings(opts)
	}

	let customizeScript = options.customizeScript ?? ""
	if (typeof customizeScript === "function") {
		customizeScript = customizeScript(opts)
	}

	const addons = []

	if (customizeScript) {
		addons.push(
			<script dangerouslySetInnerHTML={{ __html: customizeScript }} />
		)
	}

	if (scriptPath) {
		addons.push(
			<script
				data-goatcounter={countEndpoint}
				{...(settings
					? {
							"data-goatcounter-settings":
								JSON.stringify(settings),
					  }
					: {})}
				async
				src={scriptPath}
			/>
		)
	}

	if (addons.length) {
		setPostBodyComponents(addons)
	}
}
