import { getNowPerformanceTimestamp, simpleSleep } from "@teawithsand/tws-stl"

// TODO(teawithsand): implement breaking game loop
// TODO(teawithsand): implement it

export const runGameLoop = (
	logic: () => Promise<void>,
	render: () => Promise<void>,
	ticksPerSecond: number,
): {
	break: () => void
	promise: Promise<void>
} => {
	let isBroken = false
	let previous = getNowPerformanceTimestamp()
	let lag = 0
	const v = async () => {
		while (!isBroken) {
			const current = getNowPerformanceTimestamp()
			const elapsed = current - previous
			previous = current
			lag += elapsed
			while (lag >= ticksPerSecond) {
				await logic()
				lag -= ticksPerSecond
			}

			await render()

			await simpleSleep(
				Math.max(
					0,
					ticksPerSecond - (getNowPerformanceTimestamp() - current),
				),
			)
		}
	}

	const promise = v() // run in background async w/o await

	return {
		break: () => {
			isBroken = true
		},
		promise,
	}
}
