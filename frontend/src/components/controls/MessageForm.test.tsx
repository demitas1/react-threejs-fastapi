import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageForm } from './MessageForm'

describe('MessageForm', () => {
  it('renders input with default value', () => {
    render(<MessageForm onSend={vi.fn()} disabled={false} />)
    expect(screen.getByRole('textbox')).toHaveValue('Hello from React')
  })

  it('renders send button', () => {
    render(<MessageForm onSend={vi.fn()} disabled={false} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('calls onSend with input value when button clicked', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageForm onSend={onSend} disabled={false} />)

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSend).toHaveBeenCalledWith('Hello from React')
  })

  it('calls onSend with updated value after typing', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageForm onSend={onSend} disabled={false} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'test message')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSend).toHaveBeenCalledWith('test message')
  })

  it('disables button when disabled prop is true', () => {
    render(<MessageForm onSend={vi.fn()} disabled={true} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('enables button when disabled prop is false', () => {
    render(<MessageForm onSend={vi.fn()} disabled={false} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
  })

  it('updates input value on change', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSend={vi.fn()} disabled={false} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'new value')

    expect(input).toHaveValue('new value')
  })
})
