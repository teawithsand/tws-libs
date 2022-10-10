import React from "react"

import { PaintPanelType, usePanel } from "@app/components/paint/panels/panels"
import { PaintToolType } from "@app/domain/paint/defines"
import { useCurrentPaintTool } from "@app/domain/paint/redux/selector"

export const CurrentToolSettingsPanel = () => {
	const tool = useCurrentPaintTool()

	const panelType: PaintPanelType = (() => {
		if (tool === PaintToolType.PATH) {
			return PaintPanelType.TOOL_BRUSH
		} else if (tool === PaintToolType.MOVE) {
			return PaintPanelType.TOOL_MOVE
		} else {
			return PaintPanelType.EMPTY
		}
	})()

	const panel = usePanel(panelType, {
		titled: true,
	})

	return <>{panel}</>
}
