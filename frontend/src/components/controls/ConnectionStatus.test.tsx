import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionStatus } from './ConnectionStatus'

describe('ConnectionStatus', () => {
  it('renders status text', () => {
    render(<ConnectionStatus status="connected" responseSize={null} />)
    expect(screen.getByText('Status: connected')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(<ConnectionStatus status="disconnected" responseSize={null} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'WebSocket Connection'
    )
  })

  it('shows response size when provided', () => {
    render(<ConnectionStatus status="connected" responseSize={1024} />)
    expect(
      screen.getByText('Last received data size: 1024 bytes')
    ).toBeInTheDocument()
  })

  it('hides response size when null', () => {
    render(<ConnectionStatus status="connected" responseSize={null} />)
    expect(screen.queryByText(/Last received data size/)).not.toBeInTheDocument()
  })

  it('displays various status values correctly', () => {
    const { rerender } = render(
      <ConnectionStatus status="connecting" responseSize={null} />
    )
    expect(screen.getByText('Status: connecting')).toBeInTheDocument()

    rerender(<ConnectionStatus status="error" responseSize={null} />)
    expect(screen.getByText('Status: error')).toBeInTheDocument()
  })
})
