import {
	GlobalIdManager as GlobalIdManager,
	NS_REDUX_ACTION,
	NS_STORE,
} from "./index"

describe("GlobalIDManager", () => {
	let instance: GlobalIdManager
	beforeEach(() => {
		instance = GlobalIdManager.globalOrInstall()
		instance.reset()
	})

	it("allows claiming same id in different ns", () => {
		instance.claimId(NS_STORE, "some-id")
		instance.claimId(NS_REDUX_ACTION, "some-id")
	})

	it("disallows same id in same ns", () => {
		instance.claimId(NS_STORE, "some-id")
		try {
			instance.claimId(NS_STORE, "some-id")
		} catch (e) {
			return
		}
		throw new Error("can't reach here")
	})

	it("allows same id in same ns when disabled", () => {
		instance.disable()
		instance.claimId(NS_STORE, "some-id")
		instance.claimId(NS_STORE, "some-id")
	})
})
