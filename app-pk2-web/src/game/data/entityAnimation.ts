import { Rect } from "@app/util/geometry"

export enum EntityAnimationType {
	SIMPLE = 1,
}

export enum EntityAnimationImageType {
	URL = 1,
	SUB_IMAGE = 2,
}

export type EntityAnimationImage =
	| {
			type: EntityAnimationImageType.URL
			url: string
	  }
	| {
			type: EntityAnimationImageType.SUB_IMAGE
			url: string
			rect: Rect
	  }

export type SimpleEntityAnimation = {
	frames: EntityAnimationImage[] // each frame is URL,
	loop: boolean // whether animation is single-use only or should be looped or should stop at last frame.
}

export type EntityAnimation = {
	type: EntityAnimationType.SIMPLE
	animation: SimpleEntityAnimation
}
