import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeshList } from './MeshList'
import type { MeshInfo } from '../../types/gltf'

const createMockMesh = (name: string, x = 0, y = 0, z = 0): MeshInfo => ({
  name,
  materialName: 'default',
  position: { x, y, z } as THREE.Vector3,
  rotation: { x: 0, y: 0, z: 0 } as THREE.Euler,
  scale: { x: 1, y: 1, z: 1 } as THREE.Vector3,
  vertexCount: 100,
  triangleCount: 50,
})

describe('MeshList', () => {
  const defaultProps = {
    meshes: [] as MeshInfo[],
    visibility: {} as Record<string, boolean>,
    selectedMesh: null,
    onToggleVisibility: vi.fn(),
    onSelectMesh: vi.fn(),
  }

  it('renders loading message when meshes array is empty', () => {
    render(<MeshList {...defaultProps} />)
    expect(screen.getByText('Loading GLTF model...')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(<MeshList {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'GLTF Meshes'
    )
  })

  it('renders mesh list when meshes are provided', () => {
    const meshes = [createMockMesh('Cube'), createMockMesh('Sphere')]
    render(<MeshList {...defaultProps} meshes={meshes} />)

    expect(screen.getByText('Cube')).toBeInTheDocument()
    expect(screen.getByText('Sphere')).toBeInTheDocument()
  })

  it('displays mesh position correctly', () => {
    const meshes = [createMockMesh('Cube', 1.5, 2.5, 3.5)]
    render(<MeshList {...defaultProps} meshes={meshes} />)

    expect(screen.getByText(/X: 1.50, Y: 2.50, Z: 3.50/)).toBeInTheDocument()
  })

  it('renders checkboxes for each mesh', () => {
    const meshes = [createMockMesh('Cube'), createMockMesh('Sphere')]
    render(<MeshList {...defaultProps} meshes={meshes} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
  })

  it('checkbox reflects visibility state', () => {
    const meshes = [createMockMesh('Cube'), createMockMesh('Sphere')]
    const visibility = { Cube: true, Sphere: false }
    render(<MeshList {...defaultProps} meshes={meshes} visibility={visibility} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('calls onToggleVisibility when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggleVisibility = vi.fn()
    const meshes = [createMockMesh('Cube')]
    render(
      <MeshList
        {...defaultProps}
        meshes={meshes}
        onToggleVisibility={onToggleVisibility}
      />
    )

    await user.click(screen.getByRole('checkbox'))

    expect(onToggleVisibility).toHaveBeenCalledWith('Cube')
  })

  it('calls onSelectMesh when mesh item is clicked', async () => {
    const user = userEvent.setup()
    const onSelectMesh = vi.fn()
    const meshes = [createMockMesh('Cube')]
    render(
      <MeshList {...defaultProps} meshes={meshes} onSelectMesh={onSelectMesh} />
    )

    await user.click(screen.getByText('Cube'))

    expect(onSelectMesh).toHaveBeenCalledWith('Cube')
  })

  it('applies selected style to selected mesh', () => {
    const meshes = [createMockMesh('Cube'), createMockMesh('Sphere')]
    render(
      <MeshList {...defaultProps} meshes={meshes} selectedMesh="Cube" />
    )

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveStyle({ backgroundColor: 'rgb(68, 68, 68)' })
    // Non-selected item should not have the selected background
    expect(items[1]).not.toHaveStyle({ backgroundColor: 'rgb(68, 68, 68)' })
  })
})
