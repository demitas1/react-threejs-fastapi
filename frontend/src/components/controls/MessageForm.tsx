import { useState } from 'react'

interface MessageFormProps {
  onSend: (message: string) => void
  disabled: boolean
}

export const MessageForm = ({ onSend, disabled }: MessageFormProps) => {
  const [message, setMessage] = useState('Hello from React')

  const handleSubmit = () => {
    onSend(message)
  }

  return (
    <div className="message-form">
      <div className="input-group">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={disabled}>
          Send
        </button>
      </div>
    </div>
  )
}
