import type { SceneConfig, PartialSceneConfig } from './types'
import { DEFAULT_SCENE_CONFIG } from './defaults'

const CONFIG_PATH = '/config/scene.json'

/**
 * Deep merge partial config with defaults
 */
function mergeConfig(
  defaults: SceneConfig,
  partial: PartialSceneConfig
): SceneConfig {
  return {
    background: partial.background ?? defaults.background,
    camera: {
      ...defaults.camera,
      ...partial.camera,
    },
    controls: {
      ...defaults.controls,
      ...partial.controls,
    },
    lights: {
      ambient: {
        ...defaults.lights.ambient,
        ...partial.lights?.ambient,
      },
      directional: partial.lights?.directional?.map((light) => ({
        ...defaults.lights.directional[0],
        ...light,
      })) ?? defaults.lights.directional,
    },
  }
}

/**
 * Load scene configuration from external JSON file
 * Falls back to defaults if loading fails
 */
export async function loadSceneConfig(): Promise<SceneConfig> {
  try {
    const response = await fetch(CONFIG_PATH)
    if (!response.ok) {
      console.warn(
        `Failed to load scene config (${response.status}), using defaults`
      )
      return DEFAULT_SCENE_CONFIG
    }

    const partial: PartialSceneConfig = await response.json()
    return mergeConfig(DEFAULT_SCENE_CONFIG, partial)
  } catch (error) {
    console.warn('Failed to load scene config, using defaults:', error)
    return DEFAULT_SCENE_CONFIG
  }
}

/**
 * Get default scene configuration
 */
export function getDefaultConfig(): SceneConfig {
  return DEFAULT_SCENE_CONFIG
}
