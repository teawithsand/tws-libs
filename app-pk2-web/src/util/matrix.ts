export const transposeMatrix = <T>(matrix: T[][]) => {
	return matrix[0].map((_, c) => matrix.map((_, r) => matrix[r][c]))
}
