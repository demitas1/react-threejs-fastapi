import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { ISceneLoader, SceneLoadOptions, SceneLoadResult, MeshInfo } from './types'
import { ResourceDisposer } from './ResourceDisposer'

/**
 * GLTF Scene Loader implementation
 */
export class GLTFSceneLoader implements ISceneLoader {
  private loader: GLTFLoader
  private currentModel: THREE.Group | null = null
  private meshes: Map<string, THREE.Mesh> = new Map()
  private materials: Map<string, THREE.Material> = new Map()
  private textures: Map<string, THREE.Texture> = new Map()

  constructor() {
    this.loader = new GLTFLoader()
  }

  /**
   * Check if a file exists at the given URL
   */
  private async checkFileExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Load a GLTF model from URL
   */
  async load(options: SceneLoadOptions): Promise<SceneLoadResult> {
    const { url, onProgress } = options

    // Clear previous model
    this.clear()

    // Check if file exists
    const exists = await this.checkFileExists(url)
    if (!exists) {
      throw new Error(`File not found: ${url}`)
    }

    // Load GLTF
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: GLTF) => {
          const result = this.processLoadedModel(gltf)
          resolve(result)
        },
        (xhr: ProgressEvent) => {
          if (onProgress && xhr.total > 0) {
            onProgress((xhr.loaded / xhr.total) * 100)
          }
        },
        (error: unknown) => {
          reject(new Error(`Failed to load GLTF: ${error}`))
        }
      )
    })
  }

  /**
   * Process the loaded GLTF model and extract mesh information
   */
  private processLoadedModel(gltf: GLTF): SceneLoadResult {
    const model = gltf.scene
    this.currentModel = model

    const meshInfos: MeshInfo[] = []

    model.traverse((object: THREE.Object3D) => {
      if (!(object instanceof THREE.Mesh)) return

      const meshName = object.userData?.name || object.name

      // Store mesh reference
      this.meshes.set(meshName, object)
      this.meshes.set(object.name, object)

      // Process materials
      const materialName = this.processMaterials(object, meshName)

      // Enable shadows
      object.castShadow = true
      object.receiveShadow = true

      // Collect mesh info
      const meshInfo = this.extractMeshInfo(object, meshName, materialName)
      meshInfos.push(meshInfo)
    })

    return {
      model,
      meshInfos,
      meshes: new Map(this.meshes),
      materials: new Map(this.materials),
      textures: new Map(this.textures),
    }
  }

  /**
   * Process and store materials from a mesh
   */
  private processMaterials(mesh: THREE.Mesh, meshName: string): string {
    let materialName = ''

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat, index) => {
        const matName = `${meshName}_material_${index}`
        this.materials.set(matName, mat)
        this.trackMaterialTextures(mat, matName)
        if (index === 0) materialName = matName
      })
    } else {
      const matName = `${meshName}_material`
      this.materials.set(matName, mesh.material)
      this.trackMaterialTextures(mesh.material, matName)
      materialName = matName
    }

    return materialName
  }

  /**
   * Track textures associated with a material
   */
  private trackMaterialTextures(material: THREE.Material, matName: string): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      this.trackTexture(material.map, `${matName}_map`)
      this.trackTexture(material.normalMap, `${matName}_normalMap`)
      this.trackTexture(material.roughnessMap, `${matName}_roughnessMap`)
      this.trackTexture(material.metalnessMap, `${matName}_metalnessMap`)
      this.trackTexture(material.aoMap, `${matName}_aoMap`)
      this.trackTexture(material.emissiveMap, `${matName}_emissiveMap`)
    } else if (material instanceof THREE.MeshBasicMaterial) {
      this.trackTexture(material.map, `${matName}_map`)
    }
  }

  /**
   * Track a texture if it exists
   */
  private trackTexture(texture: THREE.Texture | null, name: string): void {
    if (texture) {
      this.textures.set(name, texture)
    }
  }

  /**
   * Extract mesh information from a mesh object
   */
  private extractMeshInfo(
    mesh: THREE.Mesh,
    meshName: string,
    materialName: string
  ): MeshInfo {
    let vertexCount = 0
    let triangleCount = 0

    if (mesh.geometry) {
      const position = mesh.geometry.getAttribute('position')
      if (position) {
        vertexCount = position.count
        triangleCount = Math.floor(vertexCount / 3)
      }
    }

    return {
      name: meshName,
      materialName,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      vertexCount,
      triangleCount,
    }
  }

  /**
   * Clear the current model and release resources
   */
  clear(): void {
    if (this.currentModel) {
      ResourceDisposer.disposeObject3D(this.currentModel)
      this.currentModel = null
    }

    ResourceDisposer.disposeAndClearMaps(
      this.meshes,
      this.materials,
      this.textures
    )
  }

  /**
   * Dispose all resources (alias for clear)
   */
  dispose(): void {
    this.clear()
  }

  /**
   * Get the current model
   */
  getModel(): THREE.Group | null {
    return this.currentModel
  }

  /**
   * Get mesh by name
   */
  getMesh(name: string): THREE.Mesh | undefined {
    return this.meshes.get(name)
  }

  /**
   * Set visibility for a mesh
   */
  setMeshVisibility(name: string, visible: boolean): void {
    const mesh = this.meshes.get(name)
    if (mesh) {
      mesh.visible = visible
    }
  }

  /**
   * Apply visibility settings to all meshes
   */
  applyVisibility(visibility: Record<string, boolean>): void {
    Object.entries(visibility).forEach(([name, visible]) => {
      this.setMeshVisibility(name, visible)
    })
  }
}
