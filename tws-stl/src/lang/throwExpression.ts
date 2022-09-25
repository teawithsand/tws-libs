/**
 * Allows you to use kotlin-like ?: throw or sth like that.
 *
 * Can be used like `const a = obj.x ?? throwExpression(new Error("no x"))`
 */
export const throwExpression = (e: any): never => {
	throw e
}

/**
 * Allows you to use kotlin-like ?: throw or sth like that.
 *
 * Can be used like `const a = obj.x ?? throwExpression(() => new Error("no x"))`
 */
export const throwExpressionLazy = (e: () => any): never => {
	throw e()
}
