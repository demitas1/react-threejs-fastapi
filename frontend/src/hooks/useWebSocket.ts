import { useState, useEffect, useRef, useCallback } from 'react'

export interface WebSocketMessage {
  type: 'binary' | 'json' | 'text'
  data: ArrayBuffer | object | string
  size: number
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  reconnectDelay?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  statusMessage: string
  responseSize: number | null
  send: (message: string) => void
}

export const useWebSocket = ({
  url,
  onMessage,
  reconnectDelay = 5000,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Disconnected')
  const [responseSize, setResponseSize] = useState<number | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const connect = useCallback(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setStatusMessage('Connected')
    }

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer()
        setResponseSize(event.data.size)
        console.log(`Received binary data: ${event.data.size} bytes`)

        onMessage?.({
          type: 'binary',
          data: arrayBuffer,
          size: event.data.size,
        })
      } else if (typeof event.data === 'string') {
        setResponseSize(event.data.length)

        try {
          const jsonData = JSON.parse(event.data)
          console.log('Received JSON:', jsonData)

          onMessage?.({
            type: 'json',
            data: jsonData,
            size: event.data.length,
          })
        } catch {
          console.log('Received text:', event.data)

          onMessage?.({
            type: 'text',
            data: event.data,
            size: event.data.length,
          })
        }
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      setStatusMessage('Disconnected')

      reconnectTimeoutRef.current = window.setTimeout(() => {
        if (!websocketRef.current || websocketRef.current.readyState === WebSocket.CLOSED) {
          connect()
        }
      }, reconnectDelay)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatusMessage('Connection error')
    }

    websocketRef.current = ws
  }, [url, onMessage, reconnectDelay])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [connect])

  const send = useCallback((message: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log(`Sending message: ${message}`)
      websocketRef.current.send(message)
    } else {
      console.error('WebSocket is not connected')
      setStatusMessage('Send failed: not connected')
    }
  }, [])

  return {
    isConnected,
    statusMessage,
    responseSize,
    send,
  }
}
