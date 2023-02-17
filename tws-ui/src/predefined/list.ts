import { css } from "styled-components"

export const ListStyles = {
	striped: {
		parent: css`
			& > *:nth-child(2n) {
				background-color: rgba(0, 0, 0, 0.125);
			}
		`,
	},
}
