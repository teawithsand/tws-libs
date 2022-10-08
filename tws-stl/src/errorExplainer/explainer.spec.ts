import { ErrorExplainerBuilder } from "./builder"

class CustomError extends Error {}

const Explainer = new ErrorExplainerBuilder(() => "unknown")
	.addMatcherAdapter(
		(e) => e === "asdf",
		() => "asdf"
	)
	.addClassAdapter(CustomError, () => "CustomError")
	.build()

describe("ErrorExplainer", () => {
	it("is capable of explaining errors", () => {
		expect(Explainer.explain(new Error())).toStrictEqual("unknown")
		expect(Explainer.explain("asdf")).toStrictEqual("asdf")
		expect(Explainer.explain(new CustomError())).toStrictEqual(
			"CustomError"
		)
	})
})
