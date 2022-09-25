/** 
 * See
 * https://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
 */
export function ExtendableBuiltin<T>(cls: T): T {
	const innerCls = cls as any
	function ExtendableBuiltin(this: any) {
		// eslint-disable-next-line prefer-rest-params
		innerCls.apply(this as unknown as any, arguments)
	}
	ExtendableBuiltin.prototype = Object.create(innerCls.prototype)
	Object.setPrototypeOf(ExtendableBuiltin, innerCls)

	return ExtendableBuiltin as unknown as T
}
