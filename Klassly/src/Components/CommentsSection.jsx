"use client"

import { useState, useEffect } from "react"
import { Send, Check, X, Clock, MessageCircle } from "lucide-react"
import { useAuth } from "../Context/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function CommentsSection({ announcementId, isTeacher }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [announcementId])

  async function fetchComments() {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${announcementId}/comments`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim() || posting) return

    setPosting(true)
    try {
      const res = await fetch(`${API_URL}/api/announcements/${announcementId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.comment) {
          setComments([...comments, data.comment])
        }
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
    } finally {
      setPosting(false)
    }
  }

  async function approveComment(id) {
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}/approve`, {
        method: "PUT",
        credentials: "include",
      })

      if (res.ok) {
        setComments(comments.map((c) => (c.id === id ? { ...c, approved: 1 } : c)))
      }
    } catch (error) {
      console.error("Failed to approve comment:", error)
    }
  }

  async function deleteComment(id) {
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  function renderAvatar(comment) {
    const style = {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 600,
      fontSize: 11,
      flexShrink: 0,
      overflow: "hidden",
    }

    if (comment.author_avatar) {
      return (
        <div style={style}>
          <img
            src={`${API_URL}${comment.author_avatar}`}
            alt={comment.author_name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )
    }

    return <div style={style}>{comment.author_name?.charAt(0).toUpperCase() || "U"}</div>
  }

  if (loading) {
    return (
      <div className="comments-loading">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <MessageCircle size={16} />
        <span>Comments ({comments.length})</span>
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`comment-item ${!comment.approved ? "comment-pending" : ""}`}>
              <div className="comment-avatar">
                {comment.author_avatar ? (
                  <img src={`${API_URL}${comment.author_avatar}`} alt={comment.author_name} />
                ) : (
                  <span>{comment.author_name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>

              <div className="comment-content">
                <div className="comment-meta">
                  <span className="comment-author">{comment.author_name}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                  {!comment.approved && (
                    <span className="comment-badge pending">
                      <Clock size={10} />
                      Pending
                    </span>
                  )}
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>

              <div className="comment-actions">
                {isTeacher && !comment.approved && (
                  <>
                    <button
                      className="comment-action-btn approve"
                      onClick={() => approveComment(comment.id)}
                      title="Approve"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="comment-action-btn delete"
                      onClick={() => deleteComment(comment.id)}
                      title="Delete"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
                {comment.user_id === user?.id && comment.approved === 1 && (
                  <button
                    className="comment-action-btn delete"
                    onClick={() => deleteComment(comment.id)}
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input comment-input"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="btn btn-primary comment-submit" disabled={posting || !newComment.trim()}>
          {posting ? <LoadingSpinner size="xs" /> : <Send size={16} />}
        </button>
      </form>

      {!isTeacher && <p className="comment-notice">Your comment will be visible after teacher approval</p>}
    </div>
  )
}
