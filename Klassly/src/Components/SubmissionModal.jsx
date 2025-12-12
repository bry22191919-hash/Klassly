"use client"

import { useState, useEffect } from "react"
import { X, Upload, FileText, Check, Calendar, AlertCircle, Paperclip } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function SubmissionModal({ assignment, onClose, onSubmitted }) {
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingSubmission, setFetchingSubmission] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (assignment.submission_id) {
      fetchSubmission()
    } else {
      setFetchingSubmission(false)
    }
  }, [assignment])

  async function fetchSubmission() {
    try {
      const res = await fetch(`${API_URL}/api/submissions/${assignment.submission_id}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setExistingSubmission(data.submission)
        setContent(data.submission.content || "")
      }
    } catch (error) {
      console.error("Failed to fetch submission:", error)
    } finally {
      setFetchingSubmission(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() && !file) return

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("assignmentId", assignment.id)
      formData.append("content", content)
      if (file) {
        formData.append("file", file)
      }

      const url = existingSubmission
        ? `${API_URL}/api/submissions/${existingSubmission.id}`
        : `${API_URL}/api/submissions`

      const res = await fetch(url, {
        method: existingSubmission ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit")
      }

      onSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isPastDue = new Date() > new Date(assignment.due_date)
  const dueDate = new Date(assignment.due_date)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border)",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--background)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {assignment.title}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: isPastDue ? "var(--error)" : "var(--text-muted)",
              }}
            >
              <Calendar size={12} />
              <span>
                Due: {dueDate.toLocaleDateString()} at{" "}
                {dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {isPastDue && (
                <span
                  style={{
                    background: "var(--error)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  PAST DUE
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius)",
              border: "none",
              background: "var(--surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {fetchingSubmission ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40, gap: 12 }}>
              <LoadingSpinner size="md" />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading...</p>
            </div>
          ) : (
            <>
              {/* Description */}
              {assignment.description && (
                <div
                  style={{
                    padding: 12,
                    background: "var(--background)",
                    borderRadius: "var(--radius)",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ fontWeight: 500, marginBottom: 4, color: "var(--text-primary)", fontSize: 12 }}>
                    Instructions
                  </p>
                  {assignment.description}
                </div>
              )}

              {/* Submitted Notice */}
              {existingSubmission && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 10,
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid var(--success)",
                    borderRadius: "var(--radius)",
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  <Check size={16} color="var(--success)" />
                  <span style={{ color: "var(--success)" }}>
                    Submitted on {new Date(existingSubmission.submitted_at).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 8,
                    }}
                  >
                    <FileText size={14} />
                    Your Work
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your answer or notes here..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      resize: "vertical",
                      minHeight: 100,
                      maxHeight: 150,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 8,
                    }}
                  >
                    <Paperclip size={14} />
                    Attach File
                    <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(Optional)</span>
                  </label>

                  <div
                    onClick={() => document.getElementById("file-input").click()}
                    style={{
                      padding: file ? 12 : 20,
                      border: "2px dashed var(--border)",
                      borderRadius: "var(--radius)",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "var(--background)",
                      transition: "all var(--transition)",
                    }}
                  >
                    <input
                      id="file-input"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: "none" }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />

                    {file ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <FileText size={20} color="var(--primary)" />
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "none",
                            background: "var(--error)",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Click to upload</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF, DOC, JPG, PNG (max 10MB)</p>
                      </>
                    )}
                  </div>

                  {existingSubmission?.file_name && !file && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                      <Paperclip size={12} style={{ marginRight: 4 }} />
                      Previous: {existingSubmission.file_name}
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 10,
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid var(--error)",
                      borderRadius: "var(--radius)",
                      marginBottom: 16,
                      fontSize: 13,
                      color: "var(--error)",
                    }}
                  >
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    style={{ flex: 1, padding: "10px 16px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || (!content.trim() && !file)}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {loading ? (
                      <LoadingSpinner size="xs" />
                    ) : existingSubmission ? (
                      <>
                        <Check size={16} />
                        Update
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
