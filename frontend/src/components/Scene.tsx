import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useGLTFScene } from '../hooks/useGLTFScene'
import { MeshInfo } from '../lib/gltf'

interface SceneProps {
  modelUrl?: string
  meshVisibility?: Record<string, boolean>
  onMeshesLoaded?: (meshInfos: MeshInfo[]) => void
  reloadTrigger?: number
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
    scene.background = new THREE.Color(0x222222)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerWidth / containerHeight,
      0.1,
      100
    )
    camera.position.z = 20
    cameraRef.current = camera

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

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
  }, [])

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
