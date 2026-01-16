import type {
  OrbitControlsConfig,
  MapControlsConfig,
  TrackballControlsConfig,
  FlyControlsConfig,
  FirstPersonControlsConfig,
} from '../../config/types'
import {
  OrbitControls,
  MapControls,
  TrackballControls,
  FlyControls,
  FirstPersonControls,
} from './types'

/**
 * Apply OrbitControls configuration
 */
export function applyOrbitControlsConfig(
  controls: OrbitControls,
  config: OrbitControlsConfig
): void {
  if (config.enableDamping !== undefined) controls.enableDamping = config.enableDamping
  if (config.dampingFactor !== undefined) controls.dampingFactor = config.dampingFactor
  if (config.autoRotate !== undefined) controls.autoRotate = config.autoRotate
  if (config.autoRotateSpeed !== undefined) controls.autoRotateSpeed = config.autoRotateSpeed
  if (config.enableZoom !== undefined) controls.enableZoom = config.enableZoom
  if (config.enablePan !== undefined) controls.enablePan = config.enablePan
  if (config.minDistance !== undefined) controls.minDistance = config.minDistance
  if (config.maxDistance !== undefined) controls.maxDistance = config.maxDistance
  if (config.minPolarAngle !== undefined) controls.minPolarAngle = config.minPolarAngle
  if (config.maxPolarAngle !== undefined) controls.maxPolarAngle = config.maxPolarAngle
}

/**
 * Apply MapControls configuration
 */
export function applyMapControlsConfig(
  controls: MapControls,
  config: MapControlsConfig
): void {
  if (config.enableDamping !== undefined) controls.enableDamping = config.enableDamping
  if (config.dampingFactor !== undefined) controls.dampingFactor = config.dampingFactor
  if (config.screenSpacePanning !== undefined) controls.screenSpacePanning = config.screenSpacePanning
  if (config.enableZoom !== undefined) controls.enableZoom = config.enableZoom
  if (config.minDistance !== undefined) controls.minDistance = config.minDistance
  if (config.maxDistance !== undefined) controls.maxDistance = config.maxDistance
}

/**
 * Apply TrackballControls configuration
 */
export function applyTrackballControlsConfig(
  controls: TrackballControls,
  config: TrackballControlsConfig
): void {
  if (config.rotateSpeed !== undefined) controls.rotateSpeed = config.rotateSpeed
  if (config.zoomSpeed !== undefined) controls.zoomSpeed = config.zoomSpeed
  if (config.panSpeed !== undefined) controls.panSpeed = config.panSpeed
  if (config.staticMoving !== undefined) controls.staticMoving = config.staticMoving
  if (config.dynamicDampingFactor !== undefined) controls.dynamicDampingFactor = config.dynamicDampingFactor
}

/**
 * Apply FlyControls configuration
 */
export function applyFlyControlsConfig(
  controls: FlyControls,
  config: FlyControlsConfig
): void {
  if (config.movementSpeed !== undefined) controls.movementSpeed = config.movementSpeed
  if (config.rollSpeed !== undefined) controls.rollSpeed = config.rollSpeed
  if (config.dragToLook !== undefined) controls.dragToLook = config.dragToLook
  if (config.autoForward !== undefined) controls.autoForward = config.autoForward
}

/**
 * Apply FirstPersonControls configuration
 */
export function applyFirstPersonControlsConfig(
  controls: FirstPersonControls,
  config: FirstPersonControlsConfig
): void {
  if (config.movementSpeed !== undefined) controls.movementSpeed = config.movementSpeed
  if (config.lookSpeed !== undefined) controls.lookSpeed = config.lookSpeed
  if (config.lookVertical !== undefined) controls.lookVertical = config.lookVertical
  if (config.activeLook !== undefined) controls.activeLook = config.activeLook
  if (config.constrainVertical !== undefined) controls.constrainVertical = config.constrainVertical
  if (config.verticalMin !== undefined) controls.verticalMin = config.verticalMin
  if (config.verticalMax !== undefined) controls.verticalMax = config.verticalMax
}
