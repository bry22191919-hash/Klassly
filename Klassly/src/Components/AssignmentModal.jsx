"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Calendar, Download, CheckCircle, XCircle, Clock } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function AssignmentModal({ assignment, onClose, onDelete }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    if (assignment?.id) {
      fetchStatus()
    }
  }, [assignment?.id])

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_URL}/api/assignments/${assignment.id}/status`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        const processedStudents = (data.students || []).map((student) => {
          const now = new Date()
          const dueDate = new Date(assignment.due_date)
          let status = "assigned"

          if (student.submission_id) {
            status = "submitted"
          } else if (now > dueDate) {
            status = "not_submitted"
          }

          return { ...student, status }
        })
        setStudents(processedStudents)
      }
    } catch (error) {
      console.error("Failed to fetch status:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this assignment and all submissions?")) return

    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/assignments/${assignment.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        onDelete(assignment.id)
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error)
    } finally {
      setDeleting(false)
    }
  }

  const filteredStudents = students.filter((s) => {
    if (activeTab === "all") return true
    return s.status === activeTab
  })

  const counts = {
    all: students.length,
    submitted: students.filter((s) => s.status === "submitted").length,
    not_submitted: students.filter((s) => s.status === "not_submitted").length,
    assigned: students.filter((s) => s.status === "assigned").length,
  }

  function renderAvatar(student, size = 36) {
    const style = {
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 600,
      fontSize: size * 0.4,
      overflow: "hidden",
      flexShrink: 0,
    }

    if (student.avatar) {
      return (
        <div style={style}>
          <img
            src={`${API_URL}${student.avatar}`}
            alt={student.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )
    }

    return <div style={style}>{student.name?.charAt(0).toUpperCase() || "?"}</div>
  }

  if (!assignment) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 750, maxHeight: "90vh" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{assignment.title}</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={14} />
                Due: {new Date(assignment.due_date).toLocaleString()}
              </span>
              <span>{assignment.points || 100} points</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {assignment.description && (
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
              {assignment.description}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
          }}
        >
          {[
            { key: "all", label: "All" },
            { key: "submitted", label: "Submitted" },
            { key: "not_submitted", label: "Not Submitted" },
            { key: "assigned", label: "Assigned" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 16px",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.key ? "var(--primary)" : "transparent"}`,
                color: activeTab === tab.key ? "var(--primary)" : "var(--text-secondary)",
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 500 : 400,
                cursor: "pointer",
              }}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>

        <div style={{ padding: 24, maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <LoadingSpinner />
            </div>
          ) : filteredStudents.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No students in this category</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "var(--background)",
                    borderRadius: "var(--radius)",
                    border:
                      selectedSubmission?.id === student.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                    cursor: "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {renderAvatar(student)}
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{student.email}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {student.status === "submitted" && (
                      <>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {new Date(student.submitted_at).toLocaleString()}
                        </span>
                        {student.file_path && (
                          <a
                            href={`${API_URL}${student.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={14} />
                            Download
                          </a>
                        )}
                        <span className="badge badge-success">
                          <CheckCircle size={12} style={{ marginRight: 4 }} />
                          Submitted
                        </span>
                      </>
                    )}
                    {student.status === "not_submitted" && (
                      <span className="badge badge-error">
                        <XCircle size={12} style={{ marginRight: 4 }} />
                        Not Submitted
                      </span>
                    )}
                    {student.status === "assigned" && (
                      <span className="badge badge-primary">
                        <Clock size={12} style={{ marginRight: 4 }} />
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
