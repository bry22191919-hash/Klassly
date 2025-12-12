"use client"

import { useState } from "react"
import { X, Calendar, Clock } from "lucide-react"

const API_URL = "http://localhost:5000"

export default function AssignmentForm({ classId, onClose, onCreated }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("23:59")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [points, setPoints] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return

    setLoading(true)
    setError("")

    try {
      const dueDatetime = `${dueDate}T${dueTime}:00`
      let scheduledDatetime = null

      if (scheduledDate && scheduledTime) {
        scheduledDatetime = `${scheduledDate}T${scheduledTime}:00`
      }

      const res = await fetch(`${API_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          classId,
          title,
          description,
          dueDate: dueDatetime,
          scheduledDate: scheduledDatetime,
          points,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      onCreated(data.assignment)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 500, padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Create Assignment</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Title *</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Description</label>
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              rows={4}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="input-group">
              <label>Due Date *</label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Due Time</label>
              <div style={{ position: "relative" }}>
                <Clock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="time"
                  className="input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Points</label>
            <input
              type="number"
              className="input"
              value={points}
              onChange={(e) => setPoints(Number.parseInt(e.target.value) || 0)}
              min={0}
              max={1000}
              style={{ width: 120 }}
            />
          </div>

          <div
            style={{
              padding: 16,
              background: "var(--background)",
              borderRadius: "var(--radius)",
              marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Schedule (Optional)</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              Schedule this assignment to be posted at a later date
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                type="date"
                className="input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <input
                type="time"
                className="input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {error && <p style={{ color: "var(--error)", fontSize: 14, marginBottom: 16 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !title.trim() || !dueDate}>
              {loading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
