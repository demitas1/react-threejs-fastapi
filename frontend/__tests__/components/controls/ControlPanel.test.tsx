import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlPanel } from '../../../src/components/controls/ControlPanel'
import type { MeshInfo } from '../../../src/types/gltf'

const createMockMesh = (name: string): MeshInfo => ({
  name,
  materialName: 'default',
  position: { x: 0, y: 0, z: 0 } as THREE.Vector3,
  rotation: { x: 0, y: 0, z: 0 } as THREE.Euler,
  scale: { x: 1, y: 1, z: 1 } as THREE.Vector3,
  vertexCount: 100,
  triangleCount: 50,
})

describe('ControlPanel', () => {
  const defaultProps = {
    connectionStatus: 'connected',
    responseSize: 1024,
    isConnected: true,
    onSendMessage: vi.fn(),
    sceneUrl: 'http://localhost:8000/static/model.glb',
    meshes: [] as MeshInfo[],
    meshVisibility: {} as Record<string, boolean>,
    selectedMesh: null,
    onToggleMeshVisibility: vi.fn(),
    onSelectMesh: vi.fn(),
  }

  it('renders ConnectionStatus component', () => {
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Status: connected')).toBeInTheDocument()
    expect(screen.getByText('Last received data size: 1024 bytes')).toBeInTheDocument()
  })

  it('renders MessageForm component', () => {
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('renders SceneInfo component', () => {
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('model.glb')).toBeInTheDocument()
  })

  it('renders MeshList component', () => {
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('GLTF Meshes')).toBeInTheDocument()
  })

  it('disables send button when not connected', () => {
    render(<ControlPanel {...defaultProps} isConnected={false} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('enables send button when connected', () => {
    render(<ControlPanel {...defaultProps} isConnected={true} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
  })

  it('calls onSendMessage when form is submitted', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    render(<ControlPanel {...defaultProps} onSendMessage={onSendMessage} />)

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSendMessage).toHaveBeenCalled()
  })

  it('renders mesh list with provided meshes', () => {
    const meshes = [createMockMesh('Cube'), createMockMesh('Sphere')]
    render(<ControlPanel {...defaultProps} meshes={meshes} />)

    expect(screen.getByText('Cube')).toBeInTheDocument()
    expect(screen.getByText('Sphere')).toBeInTheDocument()
  })

  it('calls onToggleMeshVisibility when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggleMeshVisibility = vi.fn()
    const meshes = [createMockMesh('Cube')]
    render(
      <ControlPanel
        {...defaultProps}
        meshes={meshes}
        onToggleMeshVisibility={onToggleMeshVisibility}
      />
    )

    await user.click(screen.getByRole('checkbox'))

    expect(onToggleMeshVisibility).toHaveBeenCalledWith('Cube')
  })

  it('calls onSelectMesh when mesh is clicked', async () => {
    const user = userEvent.setup()
    const onSelectMesh = vi.fn()
    const meshes = [createMockMesh('Cube')]
    render(
      <ControlPanel {...defaultProps} meshes={meshes} onSelectMesh={onSelectMesh} />
    )

    await user.click(screen.getByText('Cube'))

    expect(onSelectMesh).toHaveBeenCalledWith('Cube')
  })
})
