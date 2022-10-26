import { SpriteEntityHelper } from "@app/game/entity/helpers/spriteEntityHelper"
import { Entity } from "@app/game/entity/manager/entity"
import { Point, Rect } from "@app/util/geometry"

export class PlayerEntity extends Entity {
	private spriteHelper!: SpriteEntityHelper
    
	private r: Rect = new Rect([
		[0, 0],
		[32, 32],
	])

	protected registerHooks(): void {
		super.registerHooks()

		this.spriteHelper = new SpriteEntityHelper(this.hooks)
        this.spriteHelper.setRect(this.r)

		this.lcSubscribable.addSubscriber(e => {
			if (e.type === "tick") {
				this.r = this.r.translated(new Point([1, 0]))
				this.spriteHelper.setRect(this.r)
			}
		})
	}
}
