import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTFScene } from '../hooks/useGLTFScene'
import { useSceneConfig } from '../hooks/useSceneConfig'
import { MeshInfo } from '../lib/gltf'
import { CameraControls, createControls, updateControls } from '../lib/controls'
import type { SceneConfig } from '../config/types'

interface SceneProps {
  modelUrl?: string
  meshVisibility?: Record<string, boolean>
  onMeshesLoaded?: (meshInfos: MeshInfo[]) => void
  onProgress?: (progress: number) => void
  onLoadingChange?: (isLoading: boolean) => void
  reloadTrigger?: number
}

/**
 * Apply scene configuration to Three.js objects (camera and background only)
 * Controls are configured separately via createControls
 */
function applySceneConfig(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  config: SceneConfig
): void {
  // Background
  scene.background = new THREE.Color(config.background)

  // Camera
  camera.fov = config.camera.fov
  camera.near = config.camera.near
  camera.far = config.camera.far
  camera.position.set(...config.camera.position)
  camera.updateProjectionMatrix()
}

/**
 * Create lights based on configuration
 */
function createLights(config: SceneConfig): THREE.Light[] {
  const lights: THREE.Light[] = []

  // Ambient light
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(config.lights.ambient.color),
    config.lights.ambient.intensity
  )
  lights.push(ambientLight)

  // Directional lights
  for (const dirConfig of config.lights.directional) {
    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color(dirConfig.color),
      dirConfig.intensity
    )
    directionalLight.position.set(...dirConfig.position)
    lights.push(directionalLight)
  }

  return lights
}

const Scene = ({
  modelUrl = '',
  meshVisibility = {},
  onMeshesLoaded,
  onProgress,
  onLoadingChange,
  reloadTrigger = 0,
}: SceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<CameraControls>(null)
  const animationRef = useRef<number>(0)
  const lightsRef = useRef<THREE.Light[]>([])
  const clockRef = useRef<THREE.Clock | null>(null)

  // Load scene configuration
  const { config } = useSceneConfig()

  // Use GLTF Scene hook
  const { isLoading, error, getMesh, nextAnimation, updateAnimation } = useGLTFScene({
    scene: sceneRef.current,
    modelUrl,
    meshVisibility,
    onMeshesLoaded,
    onProgress,
    reloadTrigger,
  })

  // Store refs for use in animation loop and event handlers
  const getMeshRef = useRef(getMesh)
  getMeshRef.current = getMesh

  const updateAnimationRef = useRef(updateAnimation)
  updateAnimationRef.current = updateAnimation

  const nextAnimationRef = useRef(nextAnimation)
  nextAnimationRef.current = nextAnimation

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Clear existing children
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }

    const containerWidth = mountRef.current.clientWidth
    const containerHeight = mountRef.current.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerWidth, containerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera (initial setup with aspect ratio)
    const camera = new THREE.PerspectiveCamera(
      config.camera.fov,
      containerWidth / containerHeight,
      config.camera.near,
      config.camera.far
    )
    cameraRef.current = camera

    // Controls (may be null if type is 'none')
    const controls = createControls(config.controls, camera, renderer.domElement)
    controlsRef.current = controls

    // Clock for animation delta time
    const clock = new THREE.Clock()
    clockRef.current = clock

    // Apply configuration (camera and background)
    applySceneConfig(scene, camera, config)

    // Create and add lights
    const lights = createLights(config)
    lightsRef.current = lights
    for (const light of lights) {
      scene.add(light)
    }

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Click handler for animation switching
    const handleClick = () => {
      const nextName = nextAnimationRef.current()
      if (nextName) {
        console.log(`Switched to animation: ${nextName}`)
      }
    }
    renderer.domElement.addEventListener('click', handleClick)

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Get delta time
      const delta = clockRef.current ? clockRef.current.getDelta() : 0

      // Update animation mixer
      updateAnimationRef.current(delta)

      // Example: rotate meshes (access via getMeshRef)
      const cube = getMeshRef.current('Cube')
      if (cube) {
        cube.rotation.x += 0.01
      }

      const icosphere = getMeshRef.current('Icosphere')
      if (icosphere) {
        icosphere.rotation.y += 0.01
      }

      // Update controls
      updateControls(controlsRef.current, delta)

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleClick)

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }

      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
    }
  }, [config])

  // Notify loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('GLTF loading error:', error)
    }
  }, [error])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}

export default Scene
