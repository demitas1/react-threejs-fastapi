import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { GLTFSceneLoader, MeshInfo } from '../lib/gltf'

interface UseGLTFSceneOptions {
  scene: THREE.Scene | null
  modelUrl: string
  meshVisibility?: Record<string, boolean>
  onMeshesLoaded?: (meshInfos: MeshInfo[]) => void
  reloadTrigger?: number
}

interface UseGLTFSceneReturn {
  isLoading: boolean
  error: string | null
  model: THREE.Group | null
  meshInfos: MeshInfo[]
  getMesh: (name: string) => THREE.Mesh | undefined
}

export const useGLTFScene = ({
  scene,
  modelUrl,
  meshVisibility = {},
  onMeshesLoaded,
  reloadTrigger = 0,
}: UseGLTFSceneOptions): UseGLTFSceneReturn => {
  const loaderRef = useRef<GLTFSceneLoader | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [meshInfos, setMeshInfos] = useState<MeshInfo[]>([])
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
          console.log(`Loading: ${progress.toFixed(1)}%`)
        },
      })

      // Add model to scene
      scene.add(result.model)
      setModel(result.model)
      setMeshInfos(result.meshInfos)

      // Apply initial visibility
      if (Object.keys(meshVisibility).length > 0) {
        loaderRef.current.applyVisibility(meshVisibility)
      }

      // Notify parent
      if (onMeshesLoaded && !meshesInitializedRef.current) {
        meshesInitializedRef.current = true
        onMeshesLoaded(result.meshInfos)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model'
      setError(errorMessage)
      console.error('Failed to load GLTF:', err)
    } finally {
      setIsLoading(false)
    }
  }, [scene, modelUrl, meshVisibility, onMeshesLoaded])

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

  return {
    isLoading,
    error,
    model,
    meshInfos,
    getMesh,
  }
}
