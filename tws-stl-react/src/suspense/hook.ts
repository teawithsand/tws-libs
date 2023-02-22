import { useEffect } from "react"
import { useSuspensePromiseStorage } from "./storage"

/**
 * Hook that utilizes suspense in order to read data from promise it's given.
 *
 * It utilizes SuspensePromiseStorage, so some should be provided. Default one suffices though.
 *
 * This hook triggers rendering each time promise is changed,
 * so use some kind of useMemo on it in order to prevent useless rerenders.
 */
export const usePromiseSuspense = <T>(promise: Promise<T>): T => {
	const storage = useSuspensePromiseStorage()

	const claim = storage.getPromiseClaim(promise)
	useEffect(() => {
		// TODO(teawithsand): figure out if useLayoutEffect wouldn't been better when dealing with
        // activate/close race condition problem.
		claim.activate()
		return () => claim.close()
	}, [promise])

	return claim.wrapped.get()
}
