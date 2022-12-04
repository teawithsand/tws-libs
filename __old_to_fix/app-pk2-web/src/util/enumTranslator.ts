import { throwExpression } from "@teawithsand/tws-stl"

type EnumLike = string | number

export class EnumTranslatorBuilder<A extends EnumLike, B extends EnumLike> {
	private translateMap: Map<A, B> = new Map()

	value = (a: A, b: B) => {
		this.translateMap.set(a, b)
		return this
	}

	build = () => {
		return (value: A): B => {
			return (
				this.translateMap.get(value) ??
				throwExpression(
					new Error(
						`Value ${value} was not registered in trans object`,
					),
				)
			)
		}
	}
}
