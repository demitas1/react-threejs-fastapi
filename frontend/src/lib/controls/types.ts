import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { MapControls } from 'three/addons/controls/MapControls.js'
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'
import { FlyControls } from 'three/addons/controls/FlyControls.js'
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js'

/**
 * Union type for all possible camera controls
 * null represents no controls (fixed camera)
 */
export type CameraControls =
  | OrbitControls
  | MapControls
  | TrackballControls
  | FlyControls
  | FirstPersonControls
  | null

/**
 * Re-export control classes for convenience
 */
export {
  OrbitControls,
  MapControls,
  TrackballControls,
  FlyControls,
  FirstPersonControls,
}
