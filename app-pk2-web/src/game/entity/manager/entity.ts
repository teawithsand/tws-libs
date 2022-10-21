import {
	DefaultEventBus,
	DefaultStickyEventBus,
	generateUUID,
	StickySubscribable,
	Subscribable,
} from "@teawithsand/tws-stl"

import { EntityData } from "@app/game/entity/external/data"
import { EntityContext } from "@app/game/entity/manager/defines"
import { GameReactRendererHook } from "@app/game/entity/manager/renderer"
import { Point } from "@app/util/geometry"

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

export abstract class Entity {
	public readonly id = generateUUID()

	protected readonly lcResRegistry = new EntityResourceRegistry()
	private innerTickBus = new DefaultStickyEventBus<EntityContext>(
		null as any as EntityContext,
	)
	protected contextSubscribable: StickySubscribable<EntityContext> =
		this.innerTickBus

	protected innerInit(ctx: EntityContext) {
		// noop
	}

	protected innerTick(ctx: EntityContext):
		| {
				isDead?: boolean
		  }
		| undefined {
		return undefined
	}

	protected innerRelease(ctx: EntityContext): void {
		return
	}

	public readonly init = (ctx: EntityContext): void => {
		if (this.innerTickBus.lastEvent !== ctx)
			this.innerTickBus.emitEvent(ctx)
			
		this.innerInit(ctx)
	}

	public readonly tick = (
		ctx: EntityContext,
	): { isDead?: boolean } | undefined => {
		const res = this.innerTick(ctx)
		this.innerTickBus.emitEvent(ctx)
		return res
	}

	public readonly release = (ctx: EntityContext): void => {
		this.innerRelease(ctx)
		this.lcResRegistry.release()
	}
}

/**
 * Tool, which converts entity data and some other info into in-game loadable entity, which has it's logic.
 */
export interface EntityFactory {
	produceEntity(data: EntityData, coords: Point): Entity
}
