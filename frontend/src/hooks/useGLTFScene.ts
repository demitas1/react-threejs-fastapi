import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { GLTFSceneLoader, AnimationController, MeshInfo, AnimationInfo } from '../lib/gltf'

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
  const animControllerRef = useRef<AnimationController | null>(null)
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

      // Initialize AnimationController
      if (animControllerRef.current) {
        animControllerRef.current.dispose()
        animControllerRef.current = null
      }

      if (result.clips.length > 0) {
        animControllerRef.current = new AnimationController(
          result.model,
          result.clips,
          { autoPlay: true }
        )
        const animationInfos = animControllerRef.current.getAnimations()
        setAnimations(animationInfos)
        setCurrentAnimation(animControllerRef.current.getCurrentAnimationName())
      } else {
        setAnimations([])
        setCurrentAnimation(null)
      }

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
      if (onAnimationsLoaded && animControllerRef.current) {
        onAnimationsLoaded(animControllerRef.current.getAnimations())
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
      if (animControllerRef.current) {
        animControllerRef.current.dispose()
        animControllerRef.current = null
      }
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
    if (animControllerRef.current) {
      animControllerRef.current.play(name)
      setCurrentAnimation(name)
    }
  }, [])

  // Play next animation in sequence
  const nextAnimation = useCallback((): string | null => {
    if (animControllerRef.current) {
      const nextName = animControllerRef.current.next()
      if (nextName) {
        setCurrentAnimation(nextName)
      }
      return nextName
    }
    return null
  }, [])

  // Update animation mixer (call in animation loop)
  const updateAnimation = useCallback((delta: number): void => {
    animControllerRef.current?.update(delta)
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
