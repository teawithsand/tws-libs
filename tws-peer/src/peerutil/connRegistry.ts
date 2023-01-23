import {
	DefaultStickyEventBus,
	generateUUID,
	StickySubscribable,
	throwExpression,
} from "@teawithsand/tws-stl"

export interface ConnRegistryAdapterHandle<T, S, C> {
	id: string
	conn: T
	setState: (newConnState: S) => void
	connConfigBus: StickySubscribable<C>
}

export interface ConnRegistryAdapter<T, S, C> {
	makeInitialState: (conn: T, config: C) => S

	handle: (
		conn: T,
		handle: ConnRegistryAdapterHandle<T, S, C>
	) => Promise<void>

	/**
	 * Called after `handle` finishes it's execution in any way, either by returning or throwing exception.
	 *
	 * Cleanup is supposed to clean up any resources associated with connection.
	 *
	 * It's optional to implement, in this sense, that properly implemented `handle` can do the same thing.
	 */
	cleanup: (
		conn: T,
		state: S,
		config: C,
		exception: any | null
	) => Promise<void>
}

export type ConnRegistryConn<T, S, C> = {
	id: string
	promise: Promise<void> // it never throws, as unhandled throws are no no in js

	isClosed: boolean
	error: any | null

	conn: T
	adapterState: S
	config: C
}

export type ConnRegistryState<T, S, C> = {
	[key: string]: ConnRegistryConn<T, S, C> & { id: typeof key }
}

/**
 * Something like redux for connections of arbitrary type handled in async/await.
 *
 * It accepts adapter responsible for actual connection handling logic.
 */
export class ConnRegistry<T, S, C> {
	// TODO(teawithsand): unit test that class
	
	private readonly innerStateBus = new DefaultStickyEventBus<
		ConnRegistryState<T, S, C>
	>({})

	get stateBus(): StickySubscribable<ConnRegistryState<T, S, C>> {
		return this.innerStateBus
	}

	private readonly configBuses: {
		[key: string]: DefaultStickyEventBus<C>
	} = {}

	constructor(private readonly adapter: ConnRegistryAdapter<T, S, C>) {}

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
		stateSetter: (state: S) => void,
		configBus: StickySubscribable<C>
	) => {
		let error: any | null = null
		try {
			await this.adapter.handle(conn, {
				id,
				conn,
				connConfigBus: configBus,
				setState: stateSetter,
			})
		} catch (e) {
			error = e
			throw e
		} finally {
			await this.adapter.cleanup(
				conn,
				this.innerStateBus.lastEvent[id].adapterState ??
					throwExpression(new Error("Unreachable code")),
				this.configBuses[id].lastEvent ??
					throwExpression(new Error("Unreachable code")),
				error
			)
		}
	}

	/**
	 * Adds new connection to handle to this registry.
	 */
	addConn = (conn: T, config: C) => {
		const id = generateUUID()

		const helperConn: ConnRegistryConn<T, S, C> = {
			id: generateUUID(),
			config,
			conn,
			adapterState: this.adapter.makeInitialState(conn, config),
			error: null,
			isClosed: false,
			promise: null as any, // HACK(teawithsand): to get types right. It must be overridden later.
		}

		const bus = new DefaultStickyEventBus<C>(config)
		this.configBuses[id] = bus

		helperConn.promise = this.innerHandle(
			id,
			conn,
			(state) => {
				const newHelperConn: ConnRegistryConn<T, S, C> = {
					...this.innerStateBus.lastEvent[id],
					adapterState: state,
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

				const newHelperConn: ConnRegistryConn<T, S, C> = {
					...this.innerStateBus.lastEvent[id],
					isClosed: true,
				}

				this.innerStateBus.emitEvent({
					...this.innerStateBus.lastEvent,
					[id]: newHelperConn,
				})

				const copy = {
					...this.innerStateBus.lastEvent,
				}
				delete copy[id]
				this.innerStateBus.emitEvent(copy)
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
	}
}
