/**
 * Scene configuration types
 * These types define the structure of the external scene.json configuration file
 */

export interface Vector3 {
  x: number
  y: number
  z: number
}

export type Vector3Tuple = [number, number, number]

export interface CameraConfig {
  fov: number
  near: number
  far: number
  position: Vector3Tuple
}

export interface ControlsConfig {
  enableDamping: boolean
  dampingFactor: number
}

export interface AmbientLightConfig {
  color: string
  intensity: number
}

export interface DirectionalLightConfig {
  color: string
  intensity: number
  position: Vector3Tuple
}

export interface LightsConfig {
  ambient: AmbientLightConfig
  directional: DirectionalLightConfig[]
}

export interface SceneConfig {
  background: string
  camera: CameraConfig
  controls: ControlsConfig
  lights: LightsConfig
}

/**
 * Partial version of SceneConfig for merging with defaults
 */
export type PartialSceneConfig = {
  background?: string
  camera?: Partial<CameraConfig>
  controls?: Partial<ControlsConfig>
  lights?: {
    ambient?: Partial<AmbientLightConfig>
    directional?: Partial<DirectionalLightConfig>[]
  }
}
