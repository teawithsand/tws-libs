import {
	DefaultStickyEventBus,
	latePromise,
	Lock,
	MutexLockAdapter,
	StickyEventBus,
	StickySubscribable,
} from "@teawithsand/tws-stl"
import produce, { Draft } from "immer"
import { Serializer } from "../serialization"
import { ConfigStore } from "../store"
import { IntervalHelper } from "../util"
import { ConfigManager } from "./manager"

type InnerLoadedPromise = {
	promise: Promise<void>
	resolve: () => void
	reject: (e: any) => void
}

const makeInnerLoadedPromise = (): InnerLoadedPromise => {
	const [promise, resolve, reject] = latePromise<void>()

	return {
		promise,
		resolve,
		reject,
	}
}

export class DefaultConfigManager<T extends {}, E extends Record<any, string>>
	implements ConfigManager<T>
{
	// This code reminds me of times when I've written java.
	// Those times were good, unlike java code that I'd written back then.
	// That being said, it works and is not terrible, it's what OOP looks like.
	// After all, it's JAVAscript.

	private innerCurrentConfig: T | null = null
	private readonly innerBus: StickyEventBus<T | null> =
		new DefaultStickyEventBus(null)
	private readonly innerDefaultBus: StickyEventBus<T>
	private readonly intervalHelper = new IntervalHelper(0)
	private readonly saveMutex = new Lock(new MutexLockAdapter())

	private innerLoadedPromise: InnerLoadedPromise
	private readonly innerLoadedPromiseBus: StickyEventBus<Promise<void>>
	private isLoading = false
	private wasLoadingPerformedOrStarted = false
	private isClosed = false
	private configVersion = -2147483648 // min 32 bit int to stay on SMI for as long as possible
	private savedConfigVersion = -2147483648 // min 32 bit int to stay on SMI for as long as possible

	constructor(
		public readonly defaultConfig: T,
		public readonly serializer: Serializer<T, E>,
		public readonly store: ConfigStore<E>,
		public readonly saveIntervalMs: number
	) {
		if (!isFinite(saveIntervalMs) || saveIntervalMs < 0)
			throw new Error(
				`Invalid milliseconds interval value: ${saveIntervalMs}`
			)

		this.innerDefaultBus = new DefaultStickyEventBus(defaultConfig)
		this.innerLoadedPromise = makeInnerLoadedPromise()
		this.innerLoadedPromiseBus = new DefaultStickyEventBus(
			this.innerLoadedPromise.promise
		)
		this.intervalHelper.setDelay(saveIntervalMs)

		this.intervalHelper.bus.addSubscriber(() => {
			this.saveConfigIfRequired()
		})
	}

	private saveConfigIfRequired = async () => {
		await this.saveMutex.withLock(async () => {
			const version = this.configVersion
			if (version === this.savedConfigVersion) return

			const config = this.currentConfig
			if (!config) return
			const serialized = this.serializer.serialize(config)
			await this.store.store(serialized)

			this.savedConfigVersion = version
		})
	}

	get loadedPromiseBus(): StickySubscribable<Promise<void>> {
		return this.innerLoadedPromiseBus
	}

	private checkIsClosed = () => {
		if (this.isClosed) throw new Error(`Config manager closed`)
	}

	private onNewConfig = (config: T, wasMutated: boolean = true) => {
		this.innerCurrentConfig = config
		this.innerBus.emitEvent(config)
		this.innerDefaultBus.emitEvent(config)

		if (wasMutated) {
			this.configVersion++
		}
	}

	get currentConfig(): T | null {
		return this.innerCurrentConfig
	}

	get configBus(): StickySubscribable<T | null> {
		return this.innerBus
	}

	get defaultConfigBus(): StickySubscribable<T> {
		return this.innerDefaultBus
	}

	load = async () => {
		this.checkIsClosed()
		if (this.isLoading) throw new Error(`Loading is pending already`)

		if (this.wasLoadingPerformedOrStarted) {
			this.innerLoadedPromise = makeInnerLoadedPromise()
			this.innerLoadedPromiseBus.emitEvent(
				this.innerLoadedPromise.promise
			)
		}
		this.wasLoadingPerformedOrStarted = true

		this.isLoading = true
		try {
			const raw = await this.store.obtain()
			if (!raw) {
				this.onNewConfig(this.defaultConfig, false)
				this.innerLoadedPromise.resolve()
				return
			}
			const deserialized = this.serializer.deserialize(raw)

			this.onNewConfig(deserialized, false)
			this.innerLoadedPromise.resolve()
		} catch (e) {
			this.innerLoadedPromise.reject(e)
			throw e
		} finally {
			this.isLoading = false
		}
	}

	skipLoad = () => {
		this.checkIsClosed()

		this.onNewConfig(this.defaultConfig, false)
		this.innerLoadedPromise.resolve()
	}

	loadedConfigBus = (): StickySubscribable<T> => {
		this.checkIsClosed()

		if (!this.configBus.lastEvent) throw new Error(`Config not loaded yet`)
		return this.configBus as StickySubscribable<T>
	}

	updateConfig = (callback: (config: Draft<T>) => void) => {
		this.checkIsClosed()

		if (this.currentConfig === null)
			throw new Error(`Config not loaded yet`)

		const newConfig = produce(this.currentConfig, callback)
		this.onNewConfig(newConfig, true)
	}

	setConfig = (config: T) => {
		this.checkIsClosed()

		if (this.currentConfig === null)
			throw new Error(`Config not loaded yet`)
		this.onNewConfig(config, true)
	}

	save = async () => {
		this.checkIsClosed()
		if (this.currentConfig === null)
			throw new Error(`Config not loaded yet`)
		await this.saveConfigIfRequired()
	}

	close = () => {
		if (this.isClosed) return

		this.isClosed = true
		this.innerLoadedPromise.reject(new Error(`Config manager closed`))
		this.intervalHelper.disable()
	}
}
