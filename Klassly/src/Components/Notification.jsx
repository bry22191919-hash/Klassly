"use client"

import { useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

export default function Notification({ type, message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle size={20} color="var(--success)" />,
    error: <XCircle size={20} color="var(--error)" />,
    warning: <AlertCircle size={20} color="var(--warning)" />,
  }

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {icons[type]}
        <span style={{ flex: 1, fontSize: 14 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            padding: 4,
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
