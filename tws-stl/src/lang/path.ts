// TODO(teawithsand): make trailing slash stuff work with get parameters, as now they will fail

/**
 * Creates absolute URL from domain(preferably with protocol) and absolute path. It can also add/remove trailing slash
 * (by default it removes it) and switch url protocol used.
 */
export const makeUrlFromPath = (
	domain: string,
	path: string,
	options?: {
		protocol?: string
		trailingSlash?: boolean | null
	}
) => {
	const trailingSlash =
		options?.trailingSlash === null ? null : options?.trailingSlash ?? false
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const fixDomain = (d: string) => (d.endsWith("/") ? d.slice(0, -1) : d)

	const fixResult = (r: string) => {
		if (trailingSlash === true) {
			r = pathEnsureTrailingSlash(r)
		} else if (trailingSlash === false) {
			r = pathRemoveTrailingSlash(r)
		}

		return r
	}

	const domainSplit = domain.split("://")
	if (domainSplit.length === 1) {
		return fixResult(fixDomain(domainSplit[0]) + path)
	} else if (domainSplit.length === 2) {
		const proto = options?.protocol ?? domainSplit[0] ?? "https"

		const newDomain = [proto, fixDomain(domainSplit[1])].join("://")

		return fixResult(newDomain + path)
	} else {
		throw new Error(`Bad domain passed: ${domain}`)
	}
}

/**
 * Removes trailing slash(es) from path.
 * Does not work with URLs.
 */
export const pathRemoveTrailingSlash = (path: string) => {
	while (path && path.endsWith("/")) {
		path = path.slice(0, -1)
	}

	return path
}

/**
 * Adds trailing slash to path/url given.
 * Does not work with URLs.
 */
export const pathEnsureTrailingSlash = (path: string) => {
	if (!path.endsWith("/")) {
		return path + "/"
	} else {
		return path
	}
}
