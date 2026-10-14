import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader and tracks { data, loading, error }.
 * `deps` should be plain values (ids, strings) so the effect can't loop.
 * Pass `enabled: false` to skip loading (e.g. while a groupId is missing).
 */
export function useAsync(loader, deps, { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await loaderRef.current())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  useEffect(() => {
    run()
  }, [run])

  return { data, setData, loading, error, reload: run }
}
