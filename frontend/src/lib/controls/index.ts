/**
 * Camera controls library
 * Provides factory and configuration for Three.js camera controls
 */

export type { CameraControls } from './types'
export {
  OrbitControls,
  MapControls,
  TrackballControls,
  FlyControls,
  FirstPersonControls,
} from './types'

export { createControls, updateControls } from './factory'

export {
  applyOrbitControlsConfig,
  applyMapControlsConfig,
  applyTrackballControlsConfig,
  applyFlyControlsConfig,
  applyFirstPersonControlsConfig,
} from './configurators'
