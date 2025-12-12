"use client"

import { useState } from "react"
import { MoreVertical, Trash2, MessageCircle, ChevronDown, ChevronUp, Download, Paperclip } from "lucide-react"
import CommentsSection from "./CommentsSection"

const API_URL = "http://localhost:5000"

export default function PostCard({ announcement, isTeacher, onDelete, style }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this announcement?")) return

    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/announcements/${announcement.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        onDelete(announcement.id)
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error)
    } finally {
      setDeleting(false)
    }
  }

  function formatFileSize(bytes) {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  function renderAvatar() {
    const style = {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 600,
      fontSize: 16,
      overflow: "hidden",
      flexShrink: 0,
    }

    if (announcement.author_avatar) {
      return (
        <div style={style}>
          <img
            src={`${API_URL}${announcement.author_avatar}`}
            alt={announcement.author_name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )
    }

    return <div style={style}>{announcement.author_name?.charAt(0).toUpperCase() || "T"}</div>
  }

  return (
    <div className="card animate-slide-up" style={style}>
      <div className="card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              {renderAvatar()}
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{announcement.author_name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {new Date(announcement.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {isTeacher && (
            <div style={{ position: "relative" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMenu(!showMenu)} style={{ padding: 4 }}>
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 10,
                    minWidth: 150,
                  }}
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      color: "var(--error)",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {announcement.title && (
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {announcement.title}
          </h3>
        )}

        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {announcement.content}
        </p>

        {announcement.files && announcement.files.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "var(--background)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              <Paperclip size={14} />
              Attachments ({announcement.files.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {announcement.files.map((file, index) => (
                <a
                  key={index}
                  href={`${API_URL}${file.file_path}`}
                  download={file.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)"
                    e.currentTarget.style.background = "var(--surface-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)"
                    e.currentTarget.style.background = "var(--surface)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Download size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{file.file_name}</span>
                    {file.file_size && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        ({formatFileSize(file.file_size)})
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--primary)",
                      fontWeight: 500,
                    }}
                  >
                    Download
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            padding: "8px 0",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <MessageCircle size={16} />
          {announcement.comment_count || 0} comments
          {showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showComments && <CommentsSection announcementId={announcement.id} isTeacher={isTeacher} />}
      </div>
    </div>
  )
}
