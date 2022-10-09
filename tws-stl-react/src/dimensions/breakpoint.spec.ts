import {
	BREAKPOINT_LG,
	BREAKPOINT_MD,
	BREAKPOINT_SM,
	BREAKPOINT_XL,
	BREAKPOINT_XS,
	BREAKPOINT_XXL,
	breakpointMediaDown,
	breakpointMediaUp,
} from "./breakpoint"

describe("useBreakpoint stuff", () => {
	describe("breakpointMediaDown", () => {
		it("works on examples", () => {
			expect(breakpointMediaDown(BREAKPOINT_XXL)).toEqual("")
			expect(breakpointMediaDown(BREAKPOINT_XL)).toEqual(
				"(max-width: 1399.98px)"
			)
			expect(breakpointMediaDown(BREAKPOINT_LG)).toEqual(
				"(max-width: 1199.98px)"
			)
			expect(breakpointMediaDown(BREAKPOINT_MD)).toEqual(
				"(max-width: 991.98px)"
			)
			expect(breakpointMediaDown(BREAKPOINT_SM)).toEqual(
				"(max-width: 767.98px)"
			)
			expect(breakpointMediaDown(BREAKPOINT_XS)).toEqual(
				"(max-width: 575.98px)"
			)
		})
	})
	describe("breakpointMediaUp", () => {
		it("works on examples", () => {
			expect(breakpointMediaUp(BREAKPOINT_XXL)).toEqual(
				"(min-width: 1400px)"
			)
			expect(breakpointMediaUp(BREAKPOINT_XL)).toEqual(
				"(min-width: 1200px)"
			)
			expect(breakpointMediaUp(BREAKPOINT_LG)).toEqual(
				"(min-width: 992px)"
			)
			expect(breakpointMediaUp(BREAKPOINT_MD)).toEqual(
				"(min-width: 768px)"
			)
			expect(breakpointMediaUp(BREAKPOINT_SM)).toEqual(
				"(min-width: 576px)"
			)
			expect(breakpointMediaUp(BREAKPOINT_XS)).toEqual("")
		})
	})
})
