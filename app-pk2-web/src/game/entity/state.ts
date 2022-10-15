export const INITIAL_GAME_STATE: Readonly<GameState> = {
	asdf: 42,
}

export interface GameState {
	asdf: number // yikes is considered valid word :)
}
