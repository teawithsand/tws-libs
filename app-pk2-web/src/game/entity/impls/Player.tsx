import {
	EntityAnimationDisposition,
	EntityData,
	EntityDataDisposition,
} from "@app/game/data/entity"
import { BLOCK_HEIGHT, BLOCK_WIDTH } from "@app/game/data/map"
import { SpriteEntityHelper } from "@app/game/entity/helpers/spriteEntityHelper"
import { Entity } from "@app/game/entity/manager/entity"
import { Point, Rect } from "@app/util/geometry"

export class PlayerEntity extends Entity {
	private spriteHelper!: SpriteEntityHelper

	private r: Rect

	constructor(
		private data: EntityData & {
			disposition: EntityDataDisposition.PLAYER
		},
	) {
		super()

		this.r = new Rect([
			[0, 0],
			[data.collisionData.width, data.collisionData.height],
		])
	}

	protected registerHooks(): void {
		super.registerHooks()

		this.spriteHelper = new SpriteEntityHelper(this.hooks)
		this.spriteHelper.setRect(this.r)
		this.spriteHelper.setAnimationDisposition(
			EntityAnimationDisposition.WALKING,
		)
		this.spriteHelper.setEntityAnimationData(
			this.data.presentationData.animations,
		)

		this.lcSubscribable.addSubscriber(e => {
			if (e.type === "tick") {
				this.r = this.r.translated(new Point([1, 0]))
				this.spriteHelper.setRect(this.r)
			}
		})
	}
}
