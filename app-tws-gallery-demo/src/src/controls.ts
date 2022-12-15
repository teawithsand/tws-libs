import { GalleryDisplayType } from "./defines"

export interface GalleryControls {
	next: () => void
	prev: () => void
	goToIth: (i: number) => void
	setMode: (mode: GalleryDisplayType) => void
    setFullscreen: (fsc: boolean) => void
}
