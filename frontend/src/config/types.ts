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

/**
 * Available camera controls types
 * - none: Fixed camera, no user interaction
 * - orbit: OrbitControls - rotate around a target (most common)
 * - map: MapControls - map-style navigation (top-down view)
 * - trackball: TrackballControls - unrestricted rotation
 * - fly: FlyControls - flight simulator style
 * - firstPerson: FirstPersonControls - first-person view
 */
export type ControlsType = 'none' | 'orbit' | 'map' | 'trackball' | 'fly' | 'firstPerson'

/**
 * Base controls configuration (shared by all types)
 */
export interface BaseControlsConfig {
  type: ControlsType
}

/**
 * OrbitControls configuration
 */
export interface OrbitControlsConfig extends BaseControlsConfig {
  type: 'orbit'
  enableDamping?: boolean
  dampingFactor?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  enableZoom?: boolean
  enablePan?: boolean
  minDistance?: number
  maxDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
}

/**
 * MapControls configuration (OrbitControls variant for top-down view)
 */
export interface MapControlsConfig extends BaseControlsConfig {
  type: 'map'
  enableDamping?: boolean
  dampingFactor?: number
  screenSpacePanning?: boolean
  enableZoom?: boolean
  minDistance?: number
  maxDistance?: number
}

/**
 * TrackballControls configuration
 */
export interface TrackballControlsConfig extends BaseControlsConfig {
  type: 'trackball'
  rotateSpeed?: number
  zoomSpeed?: number
  panSpeed?: number
  staticMoving?: boolean
  dynamicDampingFactor?: number
}

/**
 * FlyControls configuration
 */
export interface FlyControlsConfig extends BaseControlsConfig {
  type: 'fly'
  movementSpeed?: number
  rollSpeed?: number
  dragToLook?: boolean
  autoForward?: boolean
}

/**
 * FirstPersonControls configuration
 */
export interface FirstPersonControlsConfig extends BaseControlsConfig {
  type: 'firstPerson'
  movementSpeed?: number
  lookSpeed?: number
  lookVertical?: boolean
  activeLook?: boolean
  constrainVertical?: boolean
  verticalMin?: number
  verticalMax?: number
}

/**
 * No controls (fixed camera)
 */
export interface NoControlsConfig extends BaseControlsConfig {
  type: 'none'
}

/**
 * Union type for all controls configurations
 */
export type ControlsConfig =
  | NoControlsConfig
  | OrbitControlsConfig
  | MapControlsConfig
  | TrackballControlsConfig
  | FlyControlsConfig
  | FirstPersonControlsConfig

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
 * Partial controls config - allows any controls properties with optional type
 */
export type PartialControlsConfig = {
  type?: ControlsType
  // Common properties
  enableDamping?: boolean
  dampingFactor?: number
  enableZoom?: boolean
  minDistance?: number
  maxDistance?: number
  // OrbitControls specific
  autoRotate?: boolean
  autoRotateSpeed?: number
  enablePan?: boolean
  minPolarAngle?: number
  maxPolarAngle?: number
  // MapControls specific
  screenSpacePanning?: boolean
  // TrackballControls specific
  rotateSpeed?: number
  zoomSpeed?: number
  panSpeed?: number
  staticMoving?: boolean
  dynamicDampingFactor?: number
  // FlyControls specific
  movementSpeed?: number
  rollSpeed?: number
  dragToLook?: boolean
  autoForward?: boolean
  // FirstPersonControls specific
  lookSpeed?: number
  lookVertical?: boolean
  activeLook?: boolean
  constrainVertical?: boolean
  verticalMin?: number
  verticalMax?: number
}

/**
 * Partial version of SceneConfig for merging with defaults
 */
export type PartialSceneConfig = {
  background?: string
  camera?: Partial<CameraConfig>
  controls?: PartialControlsConfig
  lights?: {
    ambient?: Partial<AmbientLightConfig>
    directional?: Partial<DirectionalLightConfig>[]
  }
}
