import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { GLTFSceneLoader, MeshInfo, AnimationInfo } from '../lib/gltf'

interface UseGLTFSceneOptions {
  scene: THREE.Scene | null
  modelUrl: string
  meshVisibility?: Record<string, boolean>
  onMeshesLoaded?: (meshInfos: MeshInfo[]) => void
  onAnimationsLoaded?: (animations: AnimationInfo[]) => void
  onProgress?: (progress: number) => void
  reloadTrigger?: number
}

interface UseGLTFSceneReturn {
  isLoading: boolean
  loadProgress: number
  error: string | null
  model: THREE.Group | null
  meshInfos: MeshInfo[]
  animations: AnimationInfo[]
  currentAnimation: string | null
  getMesh: (name: string) => THREE.Mesh | undefined
  playAnimation: (name: string) => void
  nextAnimation: () => string | null
  updateAnimation: (delta: number) => void
}

export const useGLTFScene = ({
  scene,
  modelUrl,
  meshVisibility = {},
  onMeshesLoaded,
  onAnimationsLoaded,
  onProgress,
  reloadTrigger = 0,
}: UseGLTFSceneOptions): UseGLTFSceneReturn => {
  const loaderRef = useRef<GLTFSceneLoader | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [meshInfos, setMeshInfos] = useState<MeshInfo[]>([])
  const [animations, setAnimations] = useState<AnimationInfo[]>([])
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const meshesInitializedRef = useRef(false)

  // Initialize loader
  useEffect(() => {
    loaderRef.current = new GLTFSceneLoader()

    return () => {
      if (loaderRef.current) {
        loaderRef.current.dispose()
        loaderRef.current = null
      }
    }
  }, [])

  // Load model when URL or trigger changes
  const loadModel = useCallback(async () => {
    if (!scene || !loaderRef.current || !modelUrl) {
      return
    }

    setIsLoading(true)
    setLoadProgress(0)
    setError(null)

    try {
      // Remove previous model from scene
      const previousModel = loaderRef.current.getModel()
      if (previousModel && scene) {
        scene.remove(previousModel)
      }

      // Reset state
      meshesInitializedRef.current = false

      // Load new model
      const result = await loaderRef.current.load({
        url: modelUrl,
        onProgress: (progress) => {
          setLoadProgress(progress)
          if (onProgress) {
            onProgress(progress)
          } else {
            console.log(`Loading: ${progress.toFixed(1)}%`)
          }
        },
      })

      // Add model to scene
      scene.add(result.model)
      setModel(result.model)
      setMeshInfos(result.meshInfos)
      setAnimations(result.animations)

      // Set current animation name
      const initialAnimation = loaderRef.current.getCurrentAnimationName()
      setCurrentAnimation(initialAnimation)

      // Apply initial visibility
      if (Object.keys(meshVisibility).length > 0) {
        loaderRef.current.applyVisibility(meshVisibility)
      }

      // Notify parent
      if (onMeshesLoaded && !meshesInitializedRef.current) {
        meshesInitializedRef.current = true
        onMeshesLoaded(result.meshInfos)
      }

      // Notify parent about animations
      if (onAnimationsLoaded && result.animations.length > 0) {
        onAnimationsLoaded(result.animations)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model'
      setError(errorMessage)
      console.error('Failed to load GLTF:', err)
    } finally {
      setIsLoading(false)
    }
  }, [scene, modelUrl, onMeshesLoaded, onAnimationsLoaded, onProgress])

  // Trigger load on URL or reloadTrigger change
  useEffect(() => {
    if (modelUrl) {
      loadModel()
    }
  }, [modelUrl, reloadTrigger, loadModel])

  // Apply visibility changes
  useEffect(() => {
    if (loaderRef.current && Object.keys(meshVisibility).length > 0) {
      loaderRef.current.applyVisibility(meshVisibility)
    }
  }, [meshVisibility])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loaderRef.current) {
        const currentModel = loaderRef.current.getModel()
        if (currentModel && scene) {
          scene.remove(currentModel)
        }
        loaderRef.current.dispose()
      }
    }
  }, [scene])

  // Get mesh by name
  const getMesh = useCallback((name: string): THREE.Mesh | undefined => {
    return loaderRef.current?.getMesh(name)
  }, [])

  // Play animation by name
  const playAnimation = useCallback((name: string): void => {
    if (loaderRef.current) {
      loaderRef.current.playAnimation(name)
      setCurrentAnimation(name)
    }
  }, [])

  // Play next animation in sequence
  const nextAnimation = useCallback((): string | null => {
    if (loaderRef.current) {
      const nextName = loaderRef.current.nextAnimation()
      if (nextName) {
        setCurrentAnimation(nextName)
      }
      return nextName
    }
    return null
  }, [])

  // Update animation mixer (call in animation loop)
  const updateAnimation = useCallback((delta: number): void => {
    loaderRef.current?.update(delta)
  }, [])

  return {
    isLoading,
    loadProgress,
    error,
    model,
    meshInfos,
    animations,
    currentAnimation,
    getMesh,
    playAnimation,
    nextAnimation,
    updateAnimation,
  }
}
