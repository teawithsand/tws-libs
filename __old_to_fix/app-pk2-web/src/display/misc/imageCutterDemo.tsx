import { graphql, useStaticQuery } from "gatsby"
import React, { useEffect, useState } from "react"
import styled from "styled-components"

import { throwExpression } from "@app/../../tws-stl/dist"
import { Rect } from "@app/util/geometry"
import { ImageCutter } from "@app/util/imageCutter"

const Rows = styled.div`
	display: flex;
	flex-direction: column;
`

const Cols = styled.div`
	display: grid;
	grid-auto-flow: column;
	width: fit-content;
`

const Overlap = styled.div`
	display: grid;
	* {
		grid-column: 1;
		grid-row: 1;
	}
`

export const ImageCutterDemo = () => {
	const testImage: Queries.TestCutterImageQueryQuery = useStaticQuery(graphql`
		query TestCutterImageQuery {
			allFile(
				filter: {
					sourceInstanceName: { eq: "resources" }
					name: { eq: "field_d3" }
				}
			) {
				nodes {
					publicURL
				}
			}
		}
	`)

	const testImageUrl =
		testImage.allFile.nodes[0].publicURL ||
		throwExpression("No test image url supplied")

	const [cutter, setCutter] = useState<ImageCutter>()
	useEffect(() => {
		ImageCutter.loadImage(testImageUrl, 640, 480)
			.then(v => setCutter(v))
			.catch(console.error)
	}, [testImageUrl])

	const [canvas, setCanvas] = useState<HTMLCanvasElement>()

	const [coords, setCoords] = useState<[number, number, number, number]>([
		10, 10, 20, 20,
	])
	const setIth = (i: number, v: number | string) => {
		if (typeof v === "string") v = parseInt(v)
		v = Math.max(1, v)

		const n = [...coords]
		n[i] = v

		setCoords(n)
	}

	const r = new Rect([
		[coords[0], coords[1]],
		[coords[0] + coords[2], coords[1] + coords[3]],
	]).normalized

	useEffect(() => {
		if (!canvas || !cutter) return

		const ctx =
			canvas.getContext("2d") ??
			throwExpression("Can't obtain 2d context for canvas")

		ctx.fillStyle = "#ffffff"
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		cutter.drawFragment(ctx, canvas.width, canvas.height, r)
	}, [cutter, canvas, coords])

	return (
		<Rows>
			<Cols>
				<Overlap>
					<img
						src={testImageUrl}
						style={{
							zIndex: -4,
						}}
					/>
					<div
						style={{
							width: r.width + "px",
							height: r.height + "px",
							border: "1px solid black",
							transform: `translate(${r.p1.x}px, ${r.p1.y}px)`,
							zIndex: -3,
						}}
					></div>
				</Overlap>
				<canvas
					style={{
						margin: "10px",
						border: "2px solid black",
					}}
					width={r.width}
					height={r.height}
					ref={setCanvas as any} // FIXME: do not cast this as any
				/>
			</Cols>
			<Cols>
				<input
					type="range"
					min={1}
					max={640}
					value={coords[0].toString()}
					onChange={e => setIth(0, e.target.value)}
				/>
			</Cols>
			<Cols>
				<input
					type="range"
					min={1}
					max={640}
					value={coords[1].toString()}
					onChange={e => setIth(1, e.target.value)}
				/>
			</Cols>
			<Cols>
				<input
					type="range"
					min={1}
					max={640}
					value={coords[2].toString()}
					onChange={e => setIth(2, e.target.value)}
				/>
			</Cols>
			<Cols>
				<input
					type="range"
					min={1}
					max={640}
					value={coords[3].toString()}
					onChange={e => setIth(3, e.target.value)}
				/>
			</Cols>
		</Rows>
	)
}
