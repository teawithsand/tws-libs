import { css } from "styled-components"

/**
 * Predefined styles for pretty cards.
 */
export const StylesCard = {
	/**
	 * Card, which has no padding. Otherwise same as default.
	 */
	defaultNoPadding: css`
		border: 1px solid rgba(0, 0, 0, 0.125);
		border-radius: 0.25rem;
	`,
	/**
	 * Default style for card.
	 */
	default: css`
		border: 1px solid rgba(0, 0, 0, 0.125);
		border-radius: 0.25rem;
		padding: 0.5rem 0.5rem;
	`,
}
