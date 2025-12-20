import { useState, useRef, useCallback } from 'react'
import Scene from './components/Scene'
import { ControlPanel } from './components/controls'
import { useWebSocket, WebSocketMessage } from './hooks/useWebSocket'
import { MeshInfo } from './types/gltf'

const WEBSOCKET_URL = 'ws://localhost:8000/ws'
const BACKEND_URL = 'http://localhost:8000'

function App() {
  const [meshInfos, setMeshInfos] = useState<MeshInfo[]>([])
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [meshVisibility, setMeshVisibility] = useState<Record<string, boolean>>({})
  const [currentSceneUrl, setCurrentSceneUrl] = useState<string>('')
  const [reloadScene, setReloadScene] = useState<number>(0)

  const meshesInitializedRef = useRef<boolean>(false)

  const resetMeshState = useCallback(() => {
    setMeshInfos([])
    setSelectedMesh(null)
    setMeshVisibility({})
    meshesInitializedRef.current = false
  }, [])

  const handleSceneChange = useCallback(
    (sceneUrl: string) => {
      setCurrentSceneUrl(sceneUrl)
      resetMeshState()
      setReloadScene((prev) => prev + 1)
    },
    [resetMeshState]
  )

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'binary') {
        const uint8Array = new Uint8Array(message.data as ArrayBuffer)
        if (uint8Array.length >= 4) {
          const [r, g, b, a] = uint8Array
          console.log(`RGBA: (${r}, ${g}, ${b}, ${a})`)
        }
      } else if (message.type === 'json') {
        const jsonData = message.data as Record<string, unknown>

        if (jsonData['new scene'] === 'scene1') {
          console.log('Switching to scene1')
          handleSceneChange(`${BACKEND_URL}/static/TestCube.glb`)
        } else if (jsonData['new scene'] === 'scene2' || jsonData['new scene'] === 'scene3') {
          if ('gltf_path' in jsonData) {
            const glbPath = jsonData['gltf_path'] as string
            console.log(`Switching to scene: ${glbPath}`)
            handleSceneChange(`${BACKEND_URL}/${glbPath}`)
          }
        } else if (jsonData['test message']) {
          console.log(`Test message: ${jsonData['test message']}`)
        }
      }
    },
    [handleSceneChange]
  )

  const { isConnected, statusMessage, responseSize, send } = useWebSocket({
    url: WEBSOCKET_URL,
    onMessage: handleWebSocketMessage,
  })

  const handleMeshesLoaded = useCallback((meshes: MeshInfo[]) => {
    console.log('Meshes loaded:', meshes.length)
    setMeshInfos(meshes)

    if (!meshesInitializedRef.current && meshes.length > 0) {
      meshesInitializedRef.current = true
      setSelectedMesh(meshes[0].name)

      const initialVisibility: Record<string, boolean> = {}
      meshes.forEach((mesh) => {
        initialVisibility[mesh.name] = true
      })
      setMeshVisibility(initialVisibility)
    }
  }, [])

  const toggleMeshVisibility = useCallback((meshName: string) => {
    setMeshVisibility((prev) => ({
      ...prev,
      [meshName]: !prev[meshName],
    }))
  }, [])

  return (
    <div className="app-container">
      <div className="scene-container">
        <Scene
          onMeshesLoaded={handleMeshesLoaded}
          meshVisibility={meshVisibility}
          modelUrl={currentSceneUrl}
          reloadTrigger={reloadScene}
        />
      </div>

      <ControlPanel
        connectionStatus={statusMessage}
        responseSize={responseSize}
        isConnected={isConnected}
        onSendMessage={send}
        sceneUrl={currentSceneUrl}
        meshes={meshInfos}
        meshVisibility={meshVisibility}
        selectedMesh={selectedMesh}
        onToggleMeshVisibility={toggleMeshVisibility}
        onSelectMesh={setSelectedMesh}
      />
    </div>
  )
}

export default App
