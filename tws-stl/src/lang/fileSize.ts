const units = [
	{
		size: 1024,
		name: "KB",
	},
	{
		size: 1024 ** 2,
		name: "MB",
	},
	{
		size: 1024 ** 3,
		name: "GB",
	},
	{
		size: 1024 ** 4,
		name: "TB",
	},
]

units.sort((a, b) => -(a.size - b.size))

export const formatFileSize = (n: number) => {
	n = Math.round(n)

	for (const u of units) {
		if (u.size > n) {
			continue
		}

		return `${Math.round(n / u.size)}${u.name}`
	}

	return `${n}B`
}
