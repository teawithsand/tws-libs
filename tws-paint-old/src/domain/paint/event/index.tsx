import React, { createContext, ReactNode, useContext } from "react"

import { PaintEvent } from "@app/domain/paint/defines/event"

import { DefaultEventBus, EventBus } from "tws-common/event-bus"

const PaintEventBusContext = createContext<EventBus<PaintEvent> | null>(null)

export const PaintEventBusProvider = (props: { children?: ReactNode }) => {
	return (
		<PaintEventBusContext.Provider
			value={new DefaultEventBus<PaintEvent>()}
		>
			{props.children}
		</PaintEventBusContext.Provider>
	)
}

export const usePaintEventBus = (): EventBus<PaintEvent> => {
	const bus = useContext(PaintEventBusContext)

	if (!bus) throw new Error(`No PaintEventBus was provided`)

	return bus
}
