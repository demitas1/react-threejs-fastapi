// Re-export MeshInfo from lib/gltf for backward compatibility
export type { MeshInfo } from '../lib/gltf'

// Legacy type definitions (kept for reference, may be removed in future)
export interface GltfSceneData {
  source: string | object | null
  settings?: {
    backgroundColor?: string
    ambientLight?: {
      color?: string
      intensity?: number
    }
    directionalLight?: {
      color?: string
      intensity?: number
      position?: [number, number, number]
    }
    camera?: {
      position?: [number, number, number]
      lookAt?: [number, number, number]
      fov?: number
      near?: number
      far?: number
    }
    useOrbitControls?: boolean
  }
  overrides?: {
    [objectName: string]: {
      visible?: boolean
      position?: [number, number, number]
      rotation?: [number, number, number]
      scale?: [number, number, number]
      material?: {
        color?: string
        opacity?: number
        roughness?: number
        metalness?: number
        emissive?: string
        emissiveIntensity?: number
      }
    }
  }
}
