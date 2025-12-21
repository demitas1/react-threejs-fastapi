import { useState, useEffect } from 'react'
import type { SceneConfig } from '../config/types'
import { loadSceneConfig, getDefaultConfig } from '../config/loader'

interface UseSceneConfigResult {
  config: SceneConfig
  isLoading: boolean
  error: Error | null
  reload: () => void
}

/**
 * Custom hook to load and manage scene configuration
 * Returns default config immediately while loading external config
 */
export function useSceneConfig(): UseSceneConfigResult {
  const [config, setConfig] = useState<SceneConfig>(getDefaultConfig())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const loadedConfig = await loadSceneConfig()
        if (!cancelled) {
          setConfig(loadedConfig)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => {
    setReloadKey((prev) => prev + 1)
  }

  return { config, isLoading, error, reload }
}
