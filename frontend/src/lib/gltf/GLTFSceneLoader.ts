import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { ISceneLoader, SceneLoadOptions, SceneLoadResult, MeshInfo, AnimationInfo } from './types'
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

  // Animation support
  private mixer: THREE.AnimationMixer | null = null
  private clips: THREE.AnimationClip[] = []
  private actions: Map<string, THREE.AnimationAction> = new Map()
  private currentAction: THREE.AnimationAction | null = null
  private currentAnimationIndex: number = 0

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

      // Process materials
      const materialName = this.processMaterials(object, meshName)

      // Enable shadows
      object.castShadow = true
      object.receiveShadow = true

      // Collect mesh info
      const meshInfo = this.extractMeshInfo(object, meshName, materialName)
      meshInfos.push(meshInfo)
    })

    // Process animations
    const animations = this.processAnimations(gltf, model)

    return {
      model,
      meshInfos,
      animations,
      meshes: new Map(this.meshes),
      materials: new Map(this.materials),
      textures: new Map(this.textures),
    }
  }

  /**
   * Process animations from GLTF and setup AnimationMixer
   */
  private processAnimations(gltf: GLTF, model: THREE.Group): AnimationInfo[] {
    const animations: AnimationInfo[] = []

    if (gltf.animations.length === 0) {
      return animations
    }

    // Create AnimationMixer
    this.mixer = new THREE.AnimationMixer(model)
    this.clips = gltf.animations
    this.currentAnimationIndex = 0

    // Create actions for each animation
    for (const clip of gltf.animations) {
      const action = this.mixer.clipAction(clip)
      this.actions.set(clip.name, action)

      animations.push({
        name: clip.name,
        duration: clip.duration,
      })
    }

    // Auto-play first animation
    if (animations.length > 0) {
      this.playAnimation(animations[0].name)
    }

    return animations
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
    // Stop and clear animations
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer = null
    }
    this.clips = []
    this.actions.clear()
    this.currentAction = null
    this.currentAnimationIndex = 0

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

  /**
   * Update animation mixer (call in animation loop)
   */
  update(delta: number): void {
    if (this.mixer) {
      this.mixer.update(delta)
    }
  }

  /**
   * Play animation by name with crossfade
   */
  playAnimation(name: string, fadeTime: number = 0.5): void {
    const newAction = this.actions.get(name)
    if (!newAction) return

    // Skip if same animation
    if (newAction === this.currentAction) return

    // Crossfade to new animation
    newAction.reset().setEffectiveWeight(1).play()
    if (this.currentAction) {
      this.currentAction.crossFadeTo(newAction, fadeTime, true)
    }
    this.currentAction = newAction

    // Update index
    const index = this.clips.findIndex((clip) => clip.name === name)
    if (index !== -1) {
      this.currentAnimationIndex = index
    }
  }

  /**
   * Play next animation in sequence (circular)
   */
  nextAnimation(fadeTime: number = 0.5): string | null {
    if (this.clips.length === 0) return null

    this.currentAnimationIndex = (this.currentAnimationIndex + 1) % this.clips.length
    const nextClip = this.clips[this.currentAnimationIndex]
    this.playAnimation(nextClip.name, fadeTime)

    return nextClip.name
  }

  /**
   * Get current animation name
   */
  getCurrentAnimationName(): string | null {
    if (this.clips.length === 0) return null
    return this.clips[this.currentAnimationIndex].name
  }

  /**
   * Check if model has animations
   */
  hasAnimations(): boolean {
    return this.clips.length > 0
  }
}
