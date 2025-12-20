import { MeshInfo } from '../../types/gltf'
import { ConnectionStatus } from './ConnectionStatus'
import { MessageForm } from './MessageForm'
import { SceneInfo } from './SceneInfo'
import { MeshList } from './MeshList'

interface ControlPanelProps {
  // Connection
  connectionStatus: string
  responseSize: number | null
  isConnected: boolean
  onSendMessage: (message: string) => void
  // Scene
  sceneUrl: string
  // Mesh
  meshes: MeshInfo[]
  meshVisibility: Record<string, boolean>
  selectedMesh: string | null
  onToggleMeshVisibility: (meshName: string) => void
  onSelectMesh: (meshName: string) => void
}

export const ControlPanel = ({
  connectionStatus,
  responseSize,
  isConnected,
  onSendMessage,
  sceneUrl,
  meshes,
  meshVisibility,
  selectedMesh,
  onToggleMeshVisibility,
  onSelectMesh,
}: ControlPanelProps) => {
  return (
    <div className="controls">
      <ConnectionStatus status={connectionStatus} responseSize={responseSize} />
      <MessageForm onSend={onSendMessage} disabled={!isConnected} />
      <SceneInfo sceneUrl={sceneUrl} />
      <MeshList
        meshes={meshes}
        visibility={meshVisibility}
        selectedMesh={selectedMesh}
        onToggleVisibility={onToggleMeshVisibility}
        onSelectMesh={onSelectMesh}
      />
    </div>
  )
}
