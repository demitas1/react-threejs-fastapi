interface ConnectionStatusProps {
  status: string
  responseSize: number | null
}

export const ConnectionStatus = ({ status, responseSize }: ConnectionStatusProps) => {
  return (
    <div className="connection-status">
      <h2>WebSocket Connection</h2>
      <p>Status: {status}</p>
      {responseSize !== null && (
        <p>Last received data size: {responseSize} bytes</p>
      )}
    </div>
  )
}
