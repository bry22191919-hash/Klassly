"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import "../App.css"

const API_URL = "http://localhost:5000"

const CLASS_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6"]

export default function ClassSettingsPage() {
  const { classId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#6366F1")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notification, setNotification] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchClass()
  }, [classId])

  async function fetchClass() {
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, { credentials: "include" })
      if (!res.ok) {
        navigate("/dashboard")
        return
      }
      const data = await res.json()

      if (user.role !== "teacher" || data.class.teacher_id !== user.id) {
        navigate("/dashboard")
        return
      }

      setClassData(data.class)
      setName(data.class.name)
      setDescription(data.class.description || "")
      setColor(data.class.color || "#6366F1")
    } catch (error) {
      setNotification({ type: "error", message: "Failed to load class" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      setNotification({ type: "error", message: "Class name is required" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, color }),
      })

      if (!res.ok) {
        throw new Error("Failed to update class")
      }

      setNotification({ type: "success", message: "Class updated successfully" })
    } catch (error) {
      setNotification({ type: "error", message: "Failed to update class" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to delete class")
      }

      navigate("/dashboard")
    } catch (error) {
      setNotification({ type: "error", message: "Failed to delete class" })
      setDeleting(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(classData.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!classData) {
    return null
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Link to={`/class/${classId}`} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1>Class Settings</h1>
          <p className="settings-subtitle">Manage your class details and preferences</p>
        </div>
      </div>

      <div className="settings-content">
        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>General Information</h3>
              <p>Basic details about your class</p>
            </div>
            <div className="settings-card-body">
              <div className="form-group">
                <label htmlFor="name">Class Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter class name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter class description (optional)"
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
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Class Code</h3>
              <p>Share this code with students to join your class</p>
            </div>
            <div className="settings-card-body">
              <div className="class-code-display">
                <div className="code-value">
                  <span className="code-text">{classData.code}</span>
                </div>
                <button type="button" className="copy-button" onClick={copyCode}>
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="settings-card danger-card">
          <div className="settings-card-header">
            <h3>Danger Zone</h3>
            <p>Irreversible actions for your class</p>
          </div>
          <div className="settings-card-body">
            <div className="danger-item">
              <div className="danger-info">
                <h4>Delete this class</h4>
                <p>Once deleted, all assignments, submissions, and announcements will be permanently removed.</p>
              </div>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3>Delete Class?</h3>
            <p>
              Are you sure you want to delete <strong>{classData.name}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <LoadingSpinner size="sm" /> : "Delete Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
