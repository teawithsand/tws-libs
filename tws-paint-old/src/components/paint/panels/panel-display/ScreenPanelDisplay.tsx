import React, { CSSProperties, useMemo } from "react"
import styled from "styled-components"

import { CurrentToolSettingsPanel } from "@app/components/paint/panels/impls/CurrentToolSettingsPanel"
import { ZoomPanel } from "@app/components/paint/panels/impls/ZoomPanel"
import {
	PaintPanelDisplayContext,
	PaintPanelDisplayContextData,
	PaintPanelPlace,
} from "@app/components/paint/panels/panel-display/PanelContext"
import { overlayPanelZIndex } from "@app/components/paint/pantZAxis"

/**
 * Util for displaying panels on top of paint canvas
 */
export const ScreenPanelDisplay = () => {
	const context: PaintPanelDisplayContextData = useMemo(
		() => ({
			place: PaintPanelPlace.SCREEN,
		}),
		[],
	)
	return (
		<PaintPanelDisplayContext.Provider value={context}>
			<PanelDisplayWrapper $align="bottom-left">
				<ZoomPanel />
			</PanelDisplayWrapper>
			<PanelDisplayWrapper $align="top-left">
				<CurrentToolSettingsPanel />
			</PanelDisplayWrapper>
		</PaintPanelDisplayContext.Provider>
	)
}

type PanelAlignment = "top-left" | "bottom-left" | "top-middle"

type PanelDisplayWrapperProps = {
	$align: PanelAlignment
}

const alignToStyles = (align: PanelAlignment): CSSProperties => {
	if (align === "top-left") {
		return {
			top: 0,
			left: 0,
		}
	} else if (align === "bottom-left") {
		return {
			bottom: 0,
			left: 0,
		}
	} else if (align === "top-middle") {
		return {
			top: 0,
			left: "50%",
			transform: `translateX(-50%)`,
		}
	} else {
		throw new Error(`Unsupported alignment ${align as any}`)
	}
}

const PanelDisplayWrapper = styled.div.attrs<PanelDisplayWrapperProps>(
	props => ({
		style: {
			...alignToStyles(props.$align),
		},
	}),
)<PanelDisplayWrapperProps>`
	background: rgba(255, 255, 255, 0.9);
	font-size: 1.2rem;
	padding: 0.4rem;
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border-radius: 5px;
	margin: 2px;

	position: absolute;
	width: fit-content;
	z-index: ${overlayPanelZIndex};
`
