import AppTranslation from "@app/trans/AppTranslation"

import { CommonTranslationEN_US } from "tws-common/trans/common"

const AppTranslationEN_US: AppTranslation = {
	common: CommonTranslationEN_US,
	meta: {
		title: "Teawithsand's Paint",
		description:
			"Another mixed vector/raster graphics paint. Created by teawithsand.",
		siteName: "Generic Paint application by teawithsand",
		siteKeywords: ["paint", "teawithsand"],
		siteAddress: "https://paint.teawithsand.com",
	},
	error: {
		unknown: "An unknown error occurred",
	},
	paint: {
		panel: {
			hide: "Hide panel",
			show: "Show panel",
		},
	},
}

export default AppTranslationEN_US
