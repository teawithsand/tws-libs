import React, { useState } from "react"
import { Button, Collapse } from "react-bootstrap"
import { Transition } from "react-transition-group"

export const ButtonDropdown = (
	props: {
		className?: string
		variant?: string
		children?: React.ReactElement & React.RefAttributes<Transition<any>>
		defaultShown?: boolean
	} & (
		| { shownLabel: string; hiddenLabel: string; defaultLabel?: undefined }
		| {
				defaultLabel: string
				shownLabel?: undefined
				hiddenLabel?: undefined
		  }
	),
) => {
	const {
		children,
		shownLabel,
		hiddenLabel,
		className,
		defaultShown,
		defaultLabel,
		variant,
	} = props
	const [isShow, setIsShow] = useState(defaultShown ?? false)
	return (
		<>
			<Button
				onClick={() => setIsShow(!isShow)}
				className={className}
				variant={variant}
			>
				{isShow
					? shownLabel ?? defaultLabel
					: hiddenLabel ?? defaultLabel}
			</Button>
			<Collapse in={isShow}>{children as any}</Collapse>
		</>
	)
}
