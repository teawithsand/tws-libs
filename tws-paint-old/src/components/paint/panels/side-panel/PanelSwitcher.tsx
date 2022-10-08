import React, { ReactNode, useMemo } from "react"
import { CSSTransition, SwitchTransition } from "react-transition-group"
import styled from "styled-components"

import {
	PaintPanelDisplayContext,
	PaintPanelDisplayContextData,
	PaintPanelPlace,
} from "@app/components/paint/panels/panel-display/PanelContext"
import { PaintPanelType, usePanel } from "@app/components/paint/panels/panels"

const transitionTime = 200
const transitionTimeCss = `${transitionTime}ms`

const SwitcherContainer = styled.div`
	display: grid;
	& > * {
		grid-row: 1;
		grid-column: 1;
	}

	& .dissolve-enter {
		opacity: 0;
	}
	& .dissolve-enter-active {
		opacity: 1;
		transition: opacity ${transitionTimeCss} ease-in;
	}
	& .dissolve-exit {
		opacity: 1;
	}
	& .dissolve-exit-active {
		opacity: 0;
		transition: opacity ${transitionTimeCss} ease-in;
	}
`

const SubPanelContainer = styled.div`
	background-color: rgba(255, 255, 255, 0.9);
	padding: 0.3rem;
	padding-bottom: 0.6rem;
	border-radius: 0.25rem;
	box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
		rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
		rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
`

export const PanelSwitcher = (props: {
	panelType: PaintPanelType | null
	fallbackElement: ReactNode
}) => {
	const { panelType, fallbackElement } = props

	const panel = usePanel(panelType ?? PaintPanelType.ZOOM, {
		titled: true,
	})

	const ctx: PaintPanelDisplayContextData = useMemo(() => {
		return {
			place: PaintPanelPlace.SCREEN,
		}
	}, [])

	return (
		<PaintPanelDisplayContext.Provider value={ctx}>
			<SwitcherContainer>
				<SwitchTransition mode={"out-in"}>
					<CSSTransition
						key={panelType}
						timeout={transitionTime}
						classNames="dissolve"
					>
						<SubPanelContainer>
							{panelType !== null ? panel : fallbackElement}
						</SubPanelContainer>
					</CSSTransition>
				</SwitchTransition>
			</SwitcherContainer>
		</PaintPanelDisplayContext.Provider>
	)
}
