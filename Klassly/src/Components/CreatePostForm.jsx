"use client"

import { useState, useRef } from "react"
import { Send, FileText, Paperclip, X } from "lucide-react"

const API_URL = "http://localhost:5000"

export default function CreatePostForm({ classId, onPost }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState("")
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files)
    const newFiles = [...files, ...selectedFiles].slice(0, 5)
    setFiles(newFiles)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    const trimmedContent = content.trim()

    if (!classId) {
      setError("Class ID is missing. Please refresh the page and try again.")
      return
    }

    if (!trimmedContent) {
      setError("Please enter announcement content.")
      return
    }

    setPosting(true)

    try {
      const formData = new FormData()
      formData.append("classId", classId.toString())
      formData.append("content", trimmedContent)

      if (title.trim()) {
        formData.append("title", title.trim())
      }

      // Append files
      for (const file of files) {
        formData.append("files", file)
      }

      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to post announcement")
      }

      onPost(data.announcement)
      setTitle("")
      setContent("")
      setFiles([])
    } catch (err) {
      console.error("Announcement error:", err)
      setError(err.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="create-post-form animate-fade-in-up">
      <div className="create-post-header">
        <div className="create-post-icon">
          <FileText size={20} />
        </div>
        <span>Create Announcement</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="input"
            placeholder="Announcement title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <textarea
            className="input textarea"
            placeholder="Share an announcement with your class..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        {files.length > 0 && (
          <div className="attached-files">
            {files.map((file, index) => (
              <div key={index} className="attached-file">
                <div className="file-info">
                  <Paperclip size={14} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button type="button" className="remove-file" onClick={() => removeFile(index)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="*/*"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= 5}
          >
            <Paperclip size={16} />
            Attach Files {files.length > 0 && `(${files.length}/5)`}
          </button>
          <button type="submit" className="btn btn-primary" disabled={posting || !content.trim()}>
            {posting ? (
              <>
                <span className="btn-spinner"></span>
                Posting...
              </>
            ) : (
              <>
                <Send size={16} />
                Post Announcement
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-post-form {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }

        .create-post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
        }

        .create-post-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .attached-files {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .attached-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .file-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .file-size {
          color: var(--text-muted);
        }

        .remove-file {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: var(--surface);
          border-radius: 50%;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-file:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          padding: 12px 16px;
          border-radius: var(--radius);
          font-size: 14px;
          margin-bottom: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all var(--transition);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md), var(--shadow-glow);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--surface-hover);
          color: var(--text-primary);
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
