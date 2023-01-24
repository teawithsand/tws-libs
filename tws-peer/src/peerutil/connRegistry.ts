import {
	DefaultStickyEventBus,
	generateUUID,
	StickySubscribable,
} from "@teawithsand/tws-stl"

export interface ConnRegistryAdapterHandle<T, S, C, I> {
	id: string
	conn: T
	initData: I
	setState: (newConnState: S) => void
	updateState: (callback: (oldState: Readonly<S>) => S) => void
	connConfigBus: StickySubscribable<C>
}

export interface ConnRegistryAdapter<T, S, C, I> {
	makeInitialConfig: (conn: T, initData: I, id: string) => C
	makeInitialState: (conn: T, config: C, initData: I, id: string) => S

	handle: (handle: ConnRegistryAdapterHandle<T, S, C, I>) => Promise<void>

	/**
	 * Called after `handle` finishes it's execution in any way, either by returning or throwing exception.
	 *
	 * Cleanup is supposed to clean up any resources associated with connection.
	 *
	 * It's optional to implement, in this sense, that properly implemented `handle` can do the same thing.
	 */
	cleanup: (
		handle: ConnRegistryAdapterHandle<T, S, C, I>,
		exception: any | null
	) => Promise<void>
}

export type ConnRegistryConn<T, S, C, I> = {
	id: string
	promise: Promise<void> // it never throws, as unhandled throws are no no in js

	isClosed: boolean
	error: any | null

	conn: T
	initData: I
	state: S
	config: C
}

export type ConnRegistryState<T, S, C, I> = {
	[key: string]: ConnRegistryConn<T, S, C, I> & { id: typeof key }
}

/**
 * Something like redux for connections of arbitrary type handled in async/await.
 *
 * It accepts adapter responsible for actual connection handling logic.
 */
export class ConnRegistry<T, S, C, I> {
	// TODO(teawithsand): unit test that class

	private readonly innerStateBus = new DefaultStickyEventBus<
		ConnRegistryState<T, S, C, I>
	>({})

	get stateBus(): StickySubscribable<ConnRegistryState<T, S, C, I>> {
		return this.innerStateBus
	}

	private readonly configBuses: {
		[key: string]: DefaultStickyEventBus<C>
	} = {}

	constructor(private readonly adapter: ConnRegistryAdapter<T, S, C, I>) {}

	/**
	 * Updates config in config bus for connection with id given.
	 *
	 * Call is ignored when connection with given id does not exist.
	 */
	updateConfig = (id: string, config: C) => {
		this.configBuses[id]?.emitEvent(config)
	}

	private readonly innerHandle = async (
		id: string,
		conn: T,
		initData: I,
		stateSetter: (state: S) => void,
		stateUpdater: (cb: (state: Readonly<S>) => S) => void,
		configBus: StickySubscribable<C>
	) => {
		let error: any | null = null
		const handle = {
			id,
			conn,
			connConfigBus: configBus,
			setState: stateSetter,
			updateState: stateUpdater,
			initData,
		}
		try {
			await this.adapter.handle(handle)
		} catch (e) {
			error = e
			throw e
		} finally {
			await this.adapter.cleanup(handle, error)
		}
	}

	/**
	 * Notifies registry that user has read all data from conn that it wanted to read and conn is required no more.
	 *
	 * It throws if conn with given id is not closed.
	 * It is no-op when conn with given id does not exist.
	 * 
	 * It's user responsibility via setConfig method to make it closable as soon as possible.
	 */
	removeConn = (id: string) => {
		const v = this.innerStateBus.lastEvent[id]
		if (v) {
			if (!v.isClosed) throw new Error("Conn not closed yet")

			const lastEvent = { ...this.innerStateBus.lastEvent }
			delete lastEvent[id]
			this.innerStateBus.emitEvent(lastEvent)
		}
	}

	/**
	 * Adds new connection to handle to this registry.
	 *
	 * Returns ID of registered connection.
	 */
	addConn = (conn: T, initData: I): string => {
		const id = generateUUID()

		const firstConfig = this.adapter.makeInitialConfig(conn, initData, id)
		const firstState = this.adapter.makeInitialState(
			conn,
			firstConfig,
			initData,
			id
		)

		const helperConn: ConnRegistryConn<T, S, C, I> = {
			id: generateUUID(),
			initData,
			config: firstConfig,
			state: firstState,
			conn,
			error: null,
			isClosed: false,
			promise: null as any, // HACK(teawithsand): to get types right. It must be overridden later.
		}

		const bus = new DefaultStickyEventBus<C>(helperConn.config)
		this.configBuses[id] = bus

		helperConn.promise = this.innerHandle(
			id,
			conn,
			initData,
			(state) => {
				const newHelperConn: ConnRegistryConn<T, S, C, I> = {
					...this.innerStateBus.lastEvent[id],
					state: state,
				}

				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					[id]: newHelperConn,
				})
			},
			(cb) => {
				const lastEvent = this.innerStateBus.lastEvent[id]
				const newHelperConn: ConnRegistryConn<T, S, C, I> = {
					...lastEvent,
					state: cb(lastEvent.state),
				}

				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					[id]: newHelperConn,
				})
			},
			bus
		)
			.catch(() => {
				// ignore errors thrown here
			})
			.finally(() => {
				delete this.configBuses[id]

				const newHelperConn: ConnRegistryConn<T, S, C, I> = {
					...this.innerStateBus.lastEvent[id],
					isClosed: true,
				}

				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					[id]: newHelperConn,
				})
			})

		this.innerStateBus.emitEvent({
			...this.innerStateBus.lastEvent,
			[id]: helperConn,
		})

		bus.addSubscriber((config) => {
			const newHelperConn = {
				...this.innerStateBus.lastEvent[id],
				config,
			}

			this.innerStateBus.emitEvent({
				...this.innerStateBus.lastEvent,
				[id]: newHelperConn,
			})
		})

		return id
	}
}
