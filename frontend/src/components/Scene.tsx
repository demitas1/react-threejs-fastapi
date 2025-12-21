import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useGLTFScene } from '../hooks/useGLTFScene'
import { useSceneConfig } from '../hooks/useSceneConfig'
import { MeshInfo } from '../lib/gltf'
import type { SceneConfig } from '../config/types'

interface SceneProps {
  modelUrl?: string
  meshVisibility?: Record<string, boolean>
  onMeshesLoaded?: (meshInfos: MeshInfo[]) => void
  reloadTrigger?: number
}

/**
 * Apply scene configuration to Three.js objects
 */
function applySceneConfig(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
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

  // Controls
  controls.enableDamping = config.controls.enableDamping
  controls.dampingFactor = config.controls.dampingFactor
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
  reloadTrigger = 0,
}: SceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationRef = useRef<number>(0)
  const lightsRef = useRef<THREE.Light[]>([])

  // Load scene configuration
  const { config } = useSceneConfig()

  // Use GLTF Scene hook
  const { isLoading, error, getMesh } = useGLTFScene({
    scene: sceneRef.current,
    modelUrl,
    meshVisibility,
    onMeshesLoaded,
    reloadTrigger,
  })

  // Store getMesh in ref for use in animation loop
  const getMeshRef = useRef(getMesh)
  getMeshRef.current = getMesh

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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls

    // Apply configuration
    applySceneConfig(scene, camera, controls, config)

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

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Example: rotate meshes (access via getMeshRef)
      const cube = getMeshRef.current('Cube')
      if (cube) {
        cube.rotation.x += 0.01
      }

      const icosphere = getMeshRef.current('Icosphere')
      if (icosphere) {
        icosphere.rotation.y += 0.01
      }

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)

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

  // Log loading state and errors
  useEffect(() => {
    if (isLoading) {
      console.log('Loading GLTF model...')
    }
    if (error) {
      console.error('GLTF loading error:', error)
    }
  }, [isLoading, error])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}

export default Scene
