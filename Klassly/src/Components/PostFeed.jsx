"use client"

import { useState, useEffect } from "react"
import PostCard from "./PostCard"
import CreatePostForm from "./CreatePostForm"
import LoadingSpinner from "./LoadingSpinner"
import { Megaphone } from "lucide-react"

const API_URL = "http://localhost:5000"

export default function PostFeed({ classId, isTeacher }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [classId])

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${classId}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleNewAnnouncement(announcement) {
    setAnnouncements([announcement, ...announcements])
  }

  function handleDeleteAnnouncement(id) {
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      {isTeacher && <CreatePostForm classId={classId} onPost={handleNewAnnouncement} />}

      {announcements.length === 0 ? (
        <div className="card empty-state">
          <Megaphone className="empty-state-icon" />
          <h3 className="empty-state-title">No announcements yet</h3>
          <p className="empty-state-description">
            {isTeacher
              ? "Create your first announcement to share with your class"
              : "Your teacher hasn't posted any announcements yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {announcements.map((announcement, index) => (
            <PostCard
              key={announcement.id}
              announcement={announcement}
              isTeacher={isTeacher}
              onDelete={handleDeleteAnnouncement}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
