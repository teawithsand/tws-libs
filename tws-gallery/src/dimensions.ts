const topBarHeightVar = "--gallery-top-bar-height"
const bottomBarHeightVar = "--gallery-bottom-bar-height"
const middleBarHeightVar = "--gallery-middle-bar-height"
const heightVar = "--gallery-height"

const topBarHeight = "3rem"
const bottomBarHeight = "6rem"
const middleBarHeight = `calc(var(${heightVar}) - ${topBarHeight} - ${bottomBarHeight})`
const galleryHeight = `calc(${topBarHeight} + ${bottomBarHeight} + ${middleBarHeight})`

export const galleryDimensions = Object.freeze({
	heightVar,

	galleryHeight,

	topBarHeightVar,
	bottomBarHeightVar,
	middleBarHeightVar,

	topBarHeight,
	bottomBarHeight,
	middleBarHeight,
})
