import {
	DefaultEventBus,
	DefaultStickyEventBus,
	generateUUID,
	StickySubscribable,
	Subscribable,
} from "@teawithsand/tws-stl"

import { EntityData } from "@app/game/data/entity"
import { EntityContext } from "@app/game/entity/manager/defines"
import { GameReactRendererHook } from "@app/game/entity/manager/renderer"
import { Point } from "@app/util/geometry"
import { Once } from "@app/util/once"

type Releaser = () => void

export class EntityResourceRegistry {
	private releasers: Releaser[] = []
	addGeneric = (r: Releaser) => {
		this.releasers.push(r)
	}

	addDisplayHook = (h: GameReactRendererHook<any>) => {
		this.addGeneric(() => h.release())
	}

	release = () => {
		for (const r of this.releasers) {
			r()
		}
		this.releasers = []
	}
}

export type EntityLifecycleEvent = {
	ctx: EntityContext
} & (
	| {
			type: "init"
	  }
	| {
			type: "tick"
	  }
	| {
			type: "release"
	  }
)

export type EntityHooks = {
	contextSubscribable: StickySubscribable<EntityContext>
	lcSubscribable: Subscribable<EntityLifecycleEvent>
	lcResRegistry: EntityResourceRegistry
}

export abstract class Entity {
	public readonly id = generateUUID()

	protected readonly lcResRegistry = new EntityResourceRegistry()
	private innerContextBus = new DefaultStickyEventBus<EntityContext>(
		null as any as EntityContext,
	)
	protected readonly contextSubscribable: StickySubscribable<EntityContext> =
		this.innerContextBus

	private innerLcBus = new DefaultEventBus<EntityLifecycleEvent>()
	protected readonly lcSubscribable: Subscribable<EntityLifecycleEvent> =
		this.innerLcBus

	private readonly registerHooksOnce = Once.make()

	protected hooks: Readonly<EntityHooks> = {
		contextSubscribable: this.contextSubscribable,
		lcSubscribable: this.lcSubscribable,
		lcResRegistry: this.lcResRegistry,
	}

	/**
	 * Function to bypass constructor issue, which causes class values to be undefined when it's invoked.
	 * This function is called once after initialization. It should be treated as-if it was constructor.
	 *
	 * Note: this function is must-call-super function!
	 * @mustCallSuper
	 */
	protected registerHooks() {
		// noop
	}

	protected innerInit(ctx: EntityContext) {
		// noop, to be overridden
	}

	protected innerTick(ctx: EntityContext):
		| {
				isDead?: boolean
		  }
		| undefined {
		// noop, to be overridden
		return undefined
	}

	protected innerRelease(ctx: EntityContext): void {
		// noop, to be overridden
		return
	}

	public readonly init = (ctx: EntityContext): void => {
		if (this.innerContextBus.lastEvent !== ctx)
			this.innerContextBus.emitEvent(ctx)

		this.registerHooksOnce.do(() => this.registerHooks())
		this.innerInit(ctx)

		this.innerLcBus.emitEvent({
			type: "init",
			ctx,
		})
	}

	public readonly tick = (
		ctx: EntityContext,
	): { isDead?: boolean } | undefined => {
		const res = this.innerTick(ctx)
		this.innerContextBus.emitEvent(ctx)

		this.innerLcBus.emitEvent({
			type: "tick",
			ctx,
		})

		return res
	}

	public readonly release = (ctx: EntityContext): void => {
		this.innerRelease(ctx)

		this.innerLcBus.emitEvent({
			type: "release",
			ctx,
		})

		this.lcResRegistry.release()
	}
}

/**
 * Tool, which converts entity data and some other info into in-game loadable entity, which has it's logic.
 */
export interface EntityFactory {
	produceEntity(data: EntityData, coords: Point): Entity
}
