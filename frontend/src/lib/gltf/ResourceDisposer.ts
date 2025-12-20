import * as THREE from 'three'

/**
 * Utility class for disposing Three.js resources
 */
export class ResourceDisposer {
  /**
   * Dispose a texture if it exists
   */
  static disposeTexture(texture: THREE.Texture | null): void {
    if (texture) {
      texture.dispose()
    }
  }

  /**
   * Dispose all textures associated with a material
   */
  static disposeMaterialTextures(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      this.disposeTexture(material.map)
      this.disposeTexture(material.normalMap)
      this.disposeTexture(material.roughnessMap)
      this.disposeTexture(material.metalnessMap)
      this.disposeTexture(material.aoMap)
      this.disposeTexture(material.emissiveMap)
    } else if (material instanceof THREE.MeshBasicMaterial) {
      this.disposeTexture(material.map)
    }
  }

  /**
   * Dispose a material and its associated textures
   */
  static disposeMaterial(material: THREE.Material): void {
    this.disposeMaterialTextures(material)
    material.dispose()
  }

  /**
   * Dispose all materials (handles both single material and material array)
   */
  static disposeMaterials(
    materials: THREE.Material | THREE.Material[]
  ): void {
    if (Array.isArray(materials)) {
      materials.forEach((mat) => this.disposeMaterial(mat))
    } else {
      this.disposeMaterial(materials)
    }
  }

  /**
   * Dispose a mesh's geometry and materials
   */
  static disposeMesh(mesh: THREE.Mesh): void {
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }
    if (mesh.material) {
      this.disposeMaterials(mesh.material)
    }
  }

  /**
   * Traverse and dispose all resources in an Object3D hierarchy
   */
  static disposeObject3D(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.disposeMesh(child)
      }
    })
  }

  /**
   * Dispose resources from Maps and clear them
   */
  static disposeAndClearMaps(
    meshes: Map<string, THREE.Mesh>,
    materials: Map<string, THREE.Material>,
    textures: Map<string, THREE.Texture>
  ): void {
    meshes.forEach((mesh) => {
      if (mesh.geometry) {
        mesh.geometry.dispose()
      }
    })
    meshes.clear()

    materials.forEach((material) => {
      material.dispose()
    })
    materials.clear()

    textures.forEach((texture) => {
      texture.dispose()
    })
    textures.clear()
  }
}
