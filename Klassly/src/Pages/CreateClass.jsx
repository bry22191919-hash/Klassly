"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import "../App.css"

const API_URL = "http://localhost:5000"

const CLASS_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6"]

export default function CreateClass() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#6366F1")
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      setNotification({ type: "error", message: "Class name is required" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, color }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create class")
      }

      navigate(`/class/${data.class.id}`)
    } catch (error) {
      setNotification({ type: "error", message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <Link to="/dashboard" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1>Create New Class</h1>
          <p className="create-subtitle">Set up a new classroom for your students</p>
        </div>
      </div>

      <div className="create-content">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="create-card">
            <div className="form-group">
              <label htmlFor="name">
                Class Name <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mathematics 101"
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your class (optional)"
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Theme Color</label>
              <div className="color-picker-grid">
                {CLASS_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="preview-section">
              <label>Preview</label>
              <div
                className="class-card-preview"
                style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}
              >
                <h4>{name || "Class Name"}</h4>
                <p>{description || "Your class description will appear here"}</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : "Create Class"}
            </button>
          </div>
        </form>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
