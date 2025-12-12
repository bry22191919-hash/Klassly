"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import PasswordStrength from "../Components/PasswordStrength"
import "../App.css"

const API_URL = "http://localhost:5000"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  async function handlePasswordChange(e) {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotification({ type: "error", message: "All fields are required" })
      return
    }

    if (newPassword !== confirmPassword) {
      setNotification({ type: "error", message: "New passwords do not match" })
      return
    }

    if (newPassword.length < 8) {
      setNotification({ type: "error", message: "Password must be at least 8 characters" })
      return
    }

    setSaving(true)
    try {
      console.log("[v0] Sending password change request")

      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      console.log("[v0] Password change response status:", res.status)

      const data = await res.json()
      console.log("[v0] Password change response:", data)

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setNotification({ type: "success", message: "Password changed successfully" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("[v0] Password change error:", error)
      setNotification({ type: "error", message: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-header animate-fade-in">
        <Link to="/dashboard" className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1>Settings</h1>
      </div>

      <div className="settings-content animate-slide-up">
        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <LoadingSpinner size="small" /> : "Change Password"}
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
