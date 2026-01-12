import * as THREE from 'three'

/**
 * Mesh information extracted from GLTF model
 */
export interface MeshInfo {
  name: string
  materialName: string
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  vertexCount: number
  triangleCount: number
}

/**
 * Animation information extracted from GLTF model
 */
export interface AnimationInfo {
  name: string
  duration: number
}

/**
 * Options for loading a GLTF scene
 */
export interface SceneLoadOptions {
  url: string
  onProgress?: (progress: number) => void
}

/**
 * Result of loading a GLTF scene
 */
export interface SceneLoadResult {
  model: THREE.Group
  meshInfos: MeshInfo[]
  animations: AnimationInfo[]
  meshes: Map<string, THREE.Mesh>
  materials: Map<string, THREE.Material>
  textures: Map<string, THREE.Texture>
}

/**
 * Interface for scene loaders
 */
export interface ISceneLoader {
  load(options: SceneLoadOptions): Promise<SceneLoadResult>
  clear(): void
  dispose(): void
}
