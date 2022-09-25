/**
 * Better api for WebLocks, with potential of polyfill implementation.
 *
 * It's nothing more than a simple wrapper over existing WebLocks API.
 * 
 * Note: it's not part of locks api. It's just prettier api over browser's WebLocks API.
 */
export class WebLockEx {
	constructor(public readonly key: string) {}

	claim = async (
		opts:
			| {
					exclusive?: boolean
					ifAvailable?: false
					opWhenAcquired: () => Promise<void>
					opWhenNotAcquired?: undefined
			  }
			| {
					exclusive?: boolean
					ifAvailable: true
					opWhenAcquired: () => Promise<void>
					opWhenNotAcquired: () => Promise<void>
			  }
	): Promise<void> => {
		const { exclusive, ifAvailable, opWhenAcquired, opWhenNotAcquired } =
			opts
		await navigator.locks.request(
			this.key,
			{
				mode: exclusive ? "exclusive" : "shared",
				ifAvailable: ifAvailable ?? false,
			},
			async (lock) => {
				if (lock === null && ifAvailable) {
					await opWhenNotAcquired()
				} else {
					await opWhenAcquired()
				}
			}
		)
	}
}
