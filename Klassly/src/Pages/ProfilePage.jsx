"use client"

import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import { Camera } from "lucide-react"
import "../App.css"

const API_URL = "http://localhost:5000"

export default function ProfilePage() {
  const { user, updateProfile, theme, toggleTheme } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ type: "error", message: "Image must be less than 5MB" })
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewAvatar(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      setNotification({ type: "error", message: "Name is required" })
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("theme", theme)
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      await updateProfile(formData)
      setNotification({ type: "success", message: "Profile updated successfully" })
      setAvatarFile(null)
    } catch (error) {
      setNotification({ type: "error", message: error.message })
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = previewAvatar || (user?.avatar ? `${API_URL}${user.avatar}` : null)

  return (
    <div className="profile-page">
      <div className="profile-header animate-fade-in">
        <Link to="/dashboard" className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1>Profile</h1>
      </div>

      <div className="profile-content animate-slide-up">
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar">
            <div
              className="avatar-circle avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer", position: "relative" }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl || "/placeholder.svg"}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
              )}
              <div className="avatar-overlay">
                <Camera size={24} />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <p className="avatar-hint">Click to upload photo</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={user?.email || ""} disabled className="disabled" />
              <p className="form-help">Email cannot be changed</p>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="role-badge">
                {user?.role === "teacher" ? (
                  <span className="badge badge-teacher">Teacher</span>
                ) : (
                  <span className="badge badge-student">Student</span>
                )}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="form-group">
              <label>Theme</label>
              <div className="theme-toggle">
                <button
                  type="button"
                  className={`theme-option ${theme === "light" ? "active" : ""}`}
                  onClick={() => theme !== "light" && toggleTheme()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  Light
                </button>
                <button
                  type="button"
                  className={`theme-option ${theme === "dark" ? "active" : ""}`}
                  onClick={() => theme !== "dark" && toggleTheme()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  Dark
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
