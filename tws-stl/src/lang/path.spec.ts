import { makeUrlFromPath } from "./path"

describe("path absolutize", () => {
	it("works", () => {
		expect(makeUrlFromPath("example.com", "/asdf/asdf")).toStrictEqual(
			"example.com/asdf/asdf"
		)
		expect(
			makeUrlFromPath("http://example.com", "/asdf/asdf")
		).toStrictEqual("http://example.com/asdf/asdf")

		expect(
			makeUrlFromPath("http://example.com", "/asdf/asdf", {
				protocol: "https",
			})
		).toStrictEqual("https://example.com/asdf/asdf")

		expect(makeUrlFromPath("example.com", "/asdf/asdf/")).toStrictEqual(
			"example.com/asdf/asdf"
		)

        expect(makeUrlFromPath("example.com/", "/asdf/asdf/")).toStrictEqual(
			"example.com/asdf/asdf"
		)

        expect(makeUrlFromPath("example.com/", "asdf/asdf")).toStrictEqual(
			"example.com/asdf/asdf"
		)

        expect(makeUrlFromPath("example.com/", "asdf/asdf/")).toStrictEqual(
			"example.com/asdf/asdf"
		)
	})
})
