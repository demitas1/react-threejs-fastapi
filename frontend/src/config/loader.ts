import type { SceneConfig, PartialSceneConfig, ControlsConfig, ControlsType } from './types'
import {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_ORBIT_CONTROLS,
  DEFAULT_MAP_CONTROLS,
  DEFAULT_TRACKBALL_CONTROLS,
  DEFAULT_FLY_CONTROLS,
  DEFAULT_FIRST_PERSON_CONTROLS,
} from './defaults'

const CONFIG_PATH = '/config/scene.json'

/**
 * Get default controls config by type
 */
function getDefaultControlsByType(type: ControlsType): ControlsConfig {
  switch (type) {
    case 'none':
      return { type: 'none' }
    case 'orbit':
      return DEFAULT_ORBIT_CONTROLS
    case 'map':
      return DEFAULT_MAP_CONTROLS
    case 'trackball':
      return DEFAULT_TRACKBALL_CONTROLS
    case 'fly':
      return DEFAULT_FLY_CONTROLS
    case 'firstPerson':
      return DEFAULT_FIRST_PERSON_CONTROLS
    default:
      return DEFAULT_ORBIT_CONTROLS
  }
}

/**
 * Merge controls config with appropriate defaults based on type
 */
function mergeControlsConfig(
  partial: PartialSceneConfig['controls']
): ControlsConfig {
  if (!partial) {
    return DEFAULT_ORBIT_CONTROLS
  }

  const type = partial.type ?? 'orbit'
  const defaults = getDefaultControlsByType(type)

  return {
    ...defaults,
    ...partial,
    type, // Ensure type is correctly set
  } as ControlsConfig
}

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
    controls: mergeControlsConfig(partial.controls),
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
