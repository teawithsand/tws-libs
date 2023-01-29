import {
	BusAwaiter,
	busAwaitSingleEvent,
	throwExpression,
} from "@teawithsand/tws-stl"
import {
	ConnRegistry,
	ConnRegistryAdapter,
	ConnRegistryAdapterHandle,
} from "./connRegistry"

type DummyInitData = {
	n: number
}

type DummyConn = {}

type DummyConfig = {
	done?: boolean
	throw?: any | undefined | null
	n: number
}

type DummyState = {
	n: number
}

type Registry = ConnRegistry<DummyConn, DummyState, DummyConfig, DummyInitData>

const COND_WAIT_TIME = 10

export class DummyAdapter
	implements
		ConnRegistryAdapter<DummyConn, DummyState, DummyConfig, DummyInitData>
{
	makeInitialConfig = (
		conn: DummyConn,
		initData: DummyInitData,
		id: string
	) => {
		return {
			n: 1,
		}
	}

	makeInitialState = (
		conn: DummyConn,
		config: DummyConfig,
		initData: DummyInitData,
		id: string
	) => {
		return {
			n: 1,
		}
	}

	handle = async (
		handle: ConnRegistryAdapterHandle<
			DummyConn,
			DummyState,
			DummyConfig,
			DummyInitData
		>
	) => {
		const { initData, connConfigBus, setState } = handle

		const awaiter = new BusAwaiter(connConfigBus)

		for (;;) {
			const config = await awaiter.readEvent()

			if (config.done) {
				if (config.throw) throw config.throw
				else return
			}

			setState({
				n: initData.n * config.n,
			})
		}
	}

	cleanup = async (
		handle: ConnRegistryAdapterHandle<
			DummyConn,
			DummyState,
			DummyConfig,
			DummyInitData
		>,
		exception: any
	) => {
		if (exception) throw exception
	}
}

describe("conn registry", () => {
	const runCondTest = async <T>(
		prepare: (reg: Registry) => Promise<T>,
		assert: (reg: Registry, prepared: T) => Promise<boolean>,
		errorMsg?: string
	) => {
		const registry: Registry = new ConnRegistry(new DummyAdapter())
		const res = await prepare(registry)
		for (let i = 0; i < COND_WAIT_TIME; i++) {
			if (await assert(registry, res)) return
		}

		throw new Error(errorMsg || "Filed to meet condition")
	}

	it("can add conn", async () => {
		await runCondTest(
			async (reg) => {
				return reg.addConn(
					{},
					{
						n: 2,
					}
				)
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				return s[id]?.state?.n == 2
			}
		)
	})

	it("can update conn config", async () => {
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 10,
					done: false,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				return s[id]?.state?.n == 20
			}
		)
	})

	it("can close conn", async () => {
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 10,
					done: true,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				return s[id]?.isClosed === true
			}
		)
	})

	it("can close conn", async () => {
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 10,
					done: true,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				return s[id]?.isClosed === true
			}
		)
	})

	it("can throw conn", async () => {
		const ex = new Error("Whoopsie error")
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 10,
					done: true,
					throw: ex,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				return s[id]?.error === ex
			}
		)
	})

	it("can remove conn", async () => {
		const ex = new Error("Whoopsie error")
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 1,
					done: true,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				if (s[id]?.isClosed ?? false) reg.removeConn(id)
				return !(id in s)
			}
		)
	})

	it("can wait until conn done using promise", async () => {
		const ex = new Error("Whoopsie error")
		await runCondTest(
			async (reg) => {
				const id = reg.addConn(
					{},
					{
						n: 2,
					}
				)

				reg.setConfig(id, {
					n: 10,
					done: true,
					throw: ex,
				})

				return id
			},
			async (reg, id) => {
				const s = await busAwaitSingleEvent(reg.stateBus)
				await (s[id]?.promise ??
					throwExpression(new Error("No promise")))

				return true
			}
		)
	})
})
