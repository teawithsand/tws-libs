import {
	PathLineCapType,
	PathLineJoinType,
} from "@app/domain/paint/defines/element/path"

import { Color } from "tws-common/color"

export enum PaintToolType {
	MOVE = "move",
	PATH = "path",
	ERASE = "erase",
	SELECT = "select",
}

export type PaintGlobalToolConfig = {
	activeTool: PaintToolType
	activeLayerIndex: number
	strokeColor: Color
	fillColor: Color | null
}

/**
 * Contains configuration, which are tool-specific.
 */
export type PaintToolsConfig = {
	[PaintToolType.PATH]: PathToolConfig
	[PaintToolType.MOVE]: MoveToolConfig
	[PaintToolType.ERASE]: EraseToolConfig
	[PaintToolType.SELECT]: SelectToolConfig
}

export type EraseToolConfig = {}
export type SelectToolConfig = {}
export type MoveToolConfig = {}
export type PathToolConfig = {
	stroke: PathLineCapType
	join: PathLineJoinType
}
