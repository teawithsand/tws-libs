export const debugAssert = (a: boolean, msg?: string) => {
	if (!a) throw new Error(msg || "Assertion filed")
}
