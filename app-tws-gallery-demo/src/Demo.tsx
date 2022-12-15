import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import { createGlobalStyle } from "styled-components"
import { GalleryEntry } from "./src"
import { AutonomousGallery } from "./src/gallery"
import { RawImageDisplay } from "./src/image"
import { GatsbyImageWrapper } from "./src/image/gatsby"

const BodyStyle = createGlobalStyle`
	html, body { 
		margin: 0;
		padding: 0;
	}
`

const entries: GalleryEntry[] = [
	{
		display: (
			<GatsbyImageWrapper>
				<StaticImage
					alt=""
					src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Wikipe-tan_in_Different_Anime_Styles.png/1024px-Wikipe-tan_in_Different_Anime_Styles.png"
					layout="fixed"
				/>
			</GatsbyImageWrapper>
		),
	},
	{
		display: (
			<GatsbyImageWrapper>
				<StaticImage
					alt=""
					src="http://placekitten.com/2000/500"
					layout="fixed"
				/>
			</GatsbyImageWrapper>
		),
	},
	{
		display: (
			<GatsbyImageWrapper>
				<StaticImage
					alt=""
					src="http://placekitten.com/500/2000"
					layout="fixed"
				/>
			</GatsbyImageWrapper>
		),
	},
	...[...new Array(10).keys()].map((v) => ({
		display: (
			<RawImageDisplay
				alt=""
				src={`http://placekitten.com/${
					Math.floor(Math.random() * 3000) + 100
				}/${Math.floor(Math.random() * 3000) + 100}`}
			/>
		),
	})),
]

export function Demo() {
	return (
		<>
			<BodyStyle />
			<div>
				<AutonomousGallery
					style={{
						height: "70vh",
						width: "80vw",
						marginRight: "auto",
						marginLeft: "auto",
					}}
					entries={entries}
				/>
			</div>
		</>
	)
}
