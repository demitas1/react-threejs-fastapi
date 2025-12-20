import { MeshInfo } from '../../types/gltf'

interface MeshListProps {
  meshes: MeshInfo[]
  visibility: Record<string, boolean>
  selectedMesh: string | null
  onToggleVisibility: (meshName: string) => void
  onSelectMesh: (meshName: string) => void
}

export const MeshList = ({
  meshes,
  visibility,
  selectedMesh,
  onToggleVisibility,
  onSelectMesh,
}: MeshListProps) => {
  if (meshes.length === 0) {
    return (
      <div className="mesh-section">
        <h2>GLTF Meshes</h2>
        <p>Loading GLTF model...</p>
      </div>
    )
  }

  return (
    <div className="mesh-section">
      <h2>GLTF Meshes</h2>
      <ul className="mesh-list">
        {meshes.map((mesh) => (
          <li
            key={mesh.name}
            className="mesh-item"
            style={{
              backgroundColor: selectedMesh === mesh.name ? '#444' : 'transparent',
              padding: '8px',
              marginBottom: '4px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <label className="mesh-visibility-label">
              <input
                type="checkbox"
                checked={visibility[mesh.name] || false}
                onChange={() => onToggleVisibility(mesh.name)}
                onClick={(e) => e.stopPropagation()}
              />
            </label>
            <div
              onClick={() => onSelectMesh(mesh.name)}
              style={{ flex: 1, marginLeft: '10px' }}
            >
              <div className="mesh-name">{mesh.name}</div>
              <div className="mesh-position">
                X: {mesh.position.x.toFixed(2)}, Y: {mesh.position.y.toFixed(2)}, Z:{' '}
                {mesh.position.z.toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
