/**
 * Manager is something, which works and can be disabled or enabled.
 */
export interface Manager {
	readonly isEnabled: boolean

	setEnabled(enabled: boolean): void
}
