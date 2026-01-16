import type {
  SceneConfig,
  OrbitControlsConfig,
  MapControlsConfig,
  TrackballControlsConfig,
  FlyControlsConfig,
  FirstPersonControlsConfig,
} from './types'

/**
 * Default OrbitControls configuration
 */
export const DEFAULT_ORBIT_CONTROLS: OrbitControlsConfig = {
  type: 'orbit',
  enableDamping: true,
  dampingFactor: 0.25,
  autoRotate: false,
  autoRotateSpeed: 2.0,
  enableZoom: true,
  enablePan: true,
  minDistance: 0,
  maxDistance: Infinity,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
}

/**
 * Default MapControls configuration
 */
export const DEFAULT_MAP_CONTROLS: MapControlsConfig = {
  type: 'map',
  enableDamping: true,
  dampingFactor: 0.25,
  screenSpacePanning: true,
  enableZoom: true,
  minDistance: 0,
  maxDistance: Infinity,
}

/**
 * Default TrackballControls configuration
 */
export const DEFAULT_TRACKBALL_CONTROLS: TrackballControlsConfig = {
  type: 'trackball',
  rotateSpeed: 1.0,
  zoomSpeed: 1.2,
  panSpeed: 0.3,
  staticMoving: false,
  dynamicDampingFactor: 0.2,
}

/**
 * Default FlyControls configuration
 */
export const DEFAULT_FLY_CONTROLS: FlyControlsConfig = {
  type: 'fly',
  movementSpeed: 1.0,
  rollSpeed: 0.005,
  dragToLook: false,
  autoForward: false,
}

/**
 * Default FirstPersonControls configuration
 */
export const DEFAULT_FIRST_PERSON_CONTROLS: FirstPersonControlsConfig = {
  type: 'firstPerson',
  movementSpeed: 1.0,
  lookSpeed: 0.005,
  lookVertical: true,
  activeLook: true,
  constrainVertical: false,
  verticalMin: 0,
  verticalMax: Math.PI,
}

/**
 * Default scene configuration
 * These values are used when external config is not available or partially defined
 */
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  background: '#222222',
  camera: {
    fov: 75,
    near: 0.1,
    far: 100,
    position: [0, 0, 20],
  },
  controls: DEFAULT_ORBIT_CONTROLS,
  lights: {
    ambient: {
      color: '#ffffff',
      intensity: 0.5,
    },
    directional: [
      {
        color: '#ffffff',
        intensity: 1,
        position: [5, 5, 5],
      },
    ],
  },
}
