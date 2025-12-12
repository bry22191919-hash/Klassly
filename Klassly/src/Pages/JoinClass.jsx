"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import "../App.css"

const API_URL = "http://localhost:5000"

export default function JoinClass() {
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!code.trim()) {
      setNotification({ type: "error", message: "Please enter a class code" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/classes/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to join class")
      }

      navigate(`/class/${data.class.id}`)
    } catch (error) {
      setNotification({ type: "error", message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="join-page">
      <div className="join-header animate-fade-in">
        <Link to="/dashboard" className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1>Join a Class</h1>
      </div>

      <div className="join-content animate-slide-up">
        <div className="join-card">
          <div className="join-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </div>

          <h2>Enter Class Code</h2>
          <p>Ask your teacher for the class code, then enter it here to join.</p>

          <form onSubmit={handleSubmit} className="join-form">
            <div className="form-group">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter class code"
                maxLength={6}
                className="code-input"
                autoFocus
              />
            </div>

            <div className="form-actions">
              <Link to="/dashboard" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading || !code.trim()}>
                {loading ? <LoadingSpinner size="sm" /> : "Join Class"}
              </button>
            </div>
          </form>

          <div className="join-help">
            <h4>Where to find the class code?</h4>
            <ul>
              <li>Your teacher will share a 6-character code with you</li>
              <li>The code might be shared in person, via email, or on a board</li>
              <li>Codes are case-insensitive (ABC123 = abc123)</li>
            </ul>
          </div>
        </div>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
