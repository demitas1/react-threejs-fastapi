import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  url: string
  readyState: number = MockWebSocket.CONNECTING

  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((error: unknown) => void) | null = null

  constructor(url: string) {
    this.url = url
  }

  send = vi.fn()
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
  })

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data })
  }

  simulateError(error: unknown) {
    this.onerror?.(error)
  }
}

describe('useWebSocket', () => {
  let mockWebSocket: MockWebSocket
  let mockWebSocketConstructor: ReturnType<typeof vi.fn>
  const originalWebSocket = globalThis.WebSocket

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockWebSocketConstructor = vi.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url)
      return mockWebSocket
    })

    globalThis.WebSocket = function (url: string) {
      return mockWebSocketConstructor(url)
    } as unknown as typeof WebSocket

    Object.assign(globalThis.WebSocket, {
      OPEN: MockWebSocket.OPEN,
      CLOSED: MockWebSocket.CLOSED,
      CONNECTING: MockWebSocket.CONNECTING,
      CLOSING: MockWebSocket.CLOSING,
    })
  })

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('starts disconnected', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    expect(result.current.isConnected).toBe(false)
    expect(result.current.statusMessage).toBe('Disconnected')
  })

  it('connects to WebSocket on mount', () => {
    renderHook(() => useWebSocket({ url: 'ws://localhost:8000/ws' }))

    expect(mockWebSocketConstructor).toHaveBeenCalledWith('ws://localhost:8000/ws')
  })

  it('updates state when connection opens', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    expect(result.current.isConnected).toBe(true)
    expect(result.current.statusMessage).toBe('Connected')
  })

  it('updates state when connection closes', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })
    expect(result.current.isConnected).toBe(true)

    act(() => {
      mockWebSocket.simulateClose()
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.statusMessage).toBe('Disconnected')
  })

  it('updates state on error', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateError(new Error('Connection failed'))
    })

    expect(result.current.statusMessage).toBe('Connection error')
  })

  it('sends message when connected', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    act(() => {
      result.current.send('test message')
    })

    expect(mockWebSocket.send).toHaveBeenCalledWith('test message')
  })

  it('does not send message when disconnected', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      result.current.send('test message')
    })

    expect(mockWebSocket.send).not.toHaveBeenCalled()
    expect(result.current.statusMessage).toBe('Send failed: not connected')
  })

  it('handles JSON message', () => {
    const onMessage = vi.fn()
    renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws', onMessage })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    const jsonData = JSON.stringify({ key: 'value' })
    act(() => {
      mockWebSocket.simulateMessage(jsonData)
    })

    expect(onMessage).toHaveBeenCalledWith({
      type: 'json',
      data: { key: 'value' },
      size: jsonData.length,
    })
  })

  it('handles text message', () => {
    const onMessage = vi.fn()
    renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws', onMessage })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    act(() => {
      mockWebSocket.simulateMessage('plain text')
    })

    expect(onMessage).toHaveBeenCalledWith({
      type: 'text',
      data: 'plain text',
      size: 10,
    })
  })

  it('attempts reconnection after disconnect', () => {
    renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws', reconnectDelay: 1000 })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    act(() => {
      mockWebSocket.simulateClose()
    })

    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(2)
  })

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    unmount()

    expect(mockWebSocket.close).toHaveBeenCalled()
  })

  it('clears reconnect timeout on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws', reconnectDelay: 5000 })
    )

    act(() => {
      mockWebSocket.simulateOpen()
      mockWebSocket.simulateClose()
    })

    const callCountBeforeUnmount = mockWebSocketConstructor.mock.calls.length
    unmount()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(mockWebSocketConstructor.mock.calls.length).toBe(callCountBeforeUnmount)
  })

  it('returns null for responseSize initially', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    expect(result.current.responseSize).toBeNull()
  })

  it('updates responseSize when text message received', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8000/ws' })
    )

    act(() => {
      mockWebSocket.simulateOpen()
    })

    act(() => {
      mockWebSocket.simulateMessage('hello')
    })

    expect(result.current.responseSize).toBe(5)
  })
})
