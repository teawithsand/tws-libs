export const Arrays = {
    /**
     * Zips two arrays into array of tuples.
     */
	zip: <T, E>(a: T[], b: E[]): [T, E][] => a.map((k, i) => [k, b[i]]),
}
