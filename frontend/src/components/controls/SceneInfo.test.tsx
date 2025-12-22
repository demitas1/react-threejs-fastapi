import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SceneInfo } from './SceneInfo'

describe('SceneInfo', () => {
  it('renders header', () => {
    render(<SceneInfo sceneUrl="" />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Current Scene'
    )
  })

  it('extracts scene name from URL', () => {
    render(<SceneInfo sceneUrl="http://localhost:8000/static/model.glb" />)
    expect(screen.getByText('model.glb')).toBeInTheDocument()
  })

  it('handles URL with multiple path segments', () => {
    render(
      <SceneInfo sceneUrl="http://example.com/assets/models/scene.gltf" />
    )
    expect(screen.getByText('scene.gltf')).toBeInTheDocument()
  })

  it('shows default message when sceneUrl is empty', () => {
    render(<SceneInfo sceneUrl="" />)
    expect(screen.getByText('No scene loaded')).toBeInTheDocument()
  })

  it('handles simple filename without path', () => {
    render(<SceneInfo sceneUrl="model.glb" />)
    expect(screen.getByText('model.glb')).toBeInTheDocument()
  })
})
