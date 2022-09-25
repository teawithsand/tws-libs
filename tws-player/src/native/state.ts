export enum PlayerNetworkState {
	EMPTY = 0,
	IDLE = 1,
	LOADING = 2,
	NO_SOURCE = 3,
}

export const simplePlayerNetworkStateFromNative = (
	n: number
): PlayerNetworkState => {
	if (n === 0) {
		return PlayerNetworkState.EMPTY
	} else if (n === 1) {
		return PlayerNetworkState.IDLE
	} else if (n === 2) {
		return PlayerNetworkState.LOADING
	} else if (n === 3) {
		return PlayerNetworkState.NO_SOURCE
	} else {
		return PlayerNetworkState.EMPTY // actually it should throw imho
	}
}

export enum PlayerReadyState {
	NOTHING = 0,
	METADATA = 1,
	CURRENT_DATA = 2,
	FUTURE_DATA = 3,
	ENOUGH_DATA = 4,
}

export const simplePlayerReadyStateFromNative = (
	n: number
): PlayerReadyState => {
	if (n === 0) {
		return PlayerReadyState.NOTHING
	} else if (n === 1) {
		return PlayerReadyState.METADATA
	} else if (n === 2) {
		return PlayerReadyState.CURRENT_DATA
	} else if (n === 3) {
		return PlayerReadyState.FUTURE_DATA
	} else if (n === 4) {
		return PlayerReadyState.ENOUGH_DATA
	} else {
		return PlayerReadyState.NOTHING // actually it should throw imho
	}
}
