import * as THREE from 'three'
import type {
  ControlsConfig,
  OrbitControlsConfig,
  MapControlsConfig,
  TrackballControlsConfig,
  FlyControlsConfig,
  FirstPersonControlsConfig,
} from '../../config/types'
import {
  CameraControls,
  OrbitControls,
  MapControls,
  TrackballControls,
  FlyControls,
  FirstPersonControls,
} from './types'
import {
  applyOrbitControlsConfig,
  applyMapControlsConfig,
  applyTrackballControlsConfig,
  applyFlyControlsConfig,
  applyFirstPersonControlsConfig,
} from './configurators'

/**
 * Create camera controls based on configuration
 * Returns null for 'none' type (fixed camera)
 */
export function createControls(
  config: ControlsConfig,
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): CameraControls {
  switch (config.type) {
    case 'none':
      return null

    case 'orbit': {
      const controls = new OrbitControls(camera, domElement)
      applyOrbitControlsConfig(controls, config as OrbitControlsConfig)
      return controls
    }

    case 'map': {
      const controls = new MapControls(camera, domElement)
      applyMapControlsConfig(controls, config as MapControlsConfig)
      return controls
    }

    case 'trackball': {
      const controls = new TrackballControls(camera, domElement)
      applyTrackballControlsConfig(controls, config as TrackballControlsConfig)
      return controls
    }

    case 'fly': {
      const controls = new FlyControls(camera, domElement)
      applyFlyControlsConfig(controls, config as FlyControlsConfig)
      return controls
    }

    case 'firstPerson': {
      const controls = new FirstPersonControls(camera, domElement)
      applyFirstPersonControlsConfig(controls, config as FirstPersonControlsConfig)
      return controls
    }

    default:
      console.warn(`Unknown controls type: ${(config as ControlsConfig).type}, using OrbitControls`)
      return new OrbitControls(camera, domElement)
  }
}

/**
 * Update controls in animation loop
 * Some controls (FlyControls, FirstPersonControls) require delta time
 */
export function updateControls(controls: CameraControls, delta: number): void {
  if (!controls) return

  if (controls instanceof FlyControls || controls instanceof FirstPersonControls) {
    controls.update(delta)
  } else {
    controls.update()
  }
}
