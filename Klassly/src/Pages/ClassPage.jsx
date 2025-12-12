"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import PostFeed from "../Components/PostFeed"
import AssignmentsContainer from "../Components/AssignmentsContainer"
import ViewMembers from "../Components/ViewMembers"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import "../App.css"

const API_URL = "http://localhost:5000"

export default function ClassPage() {
  const { classId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [activeTab, setActiveTab] = useState("stream")
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  const fetchClassData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, { credentials: "include" })
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          navigate("/dashboard")
          return
        }
        throw new Error("Failed to fetch class")
      }
      const data = await res.json()
      setClassData(data.class)
    } catch (error) {
      setNotification({ type: "error", message: "Failed to load class" })
    } finally {
      setLoading(false)
    }
  }, [classId, navigate])

  useEffect(() => {
    fetchClassData()
  }, [fetchClassData])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!classData) {
    return null
  }

  const isTeacher = user.role === "teacher"

  return (
    <div className="class-page">
      <div className="class-header animate-fade-in" style={{ backgroundColor: classData.color || "#4F46E5" }}>
        <div className="class-header-content">
          <Link to="/dashboard" className="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="class-header-info">
            <h1 className="class-name">{classData.name}</h1>
            {classData.description && <p className="class-description">{classData.description}</p>}
            {isTeacher && (
              <div className="class-code">
                <span>Class Code:</span>
                <code
                  onClick={() => {
                    navigator.clipboard.writeText(classData.code)
                    setNotification({ type: "success", message: "Code copied!" })
                  }}
                >
                  {classData.code}
                </code>
              </div>
            )}
          </div>
          {isTeacher && (
            <Link to={`/class/${classId}/settings`} className="settings-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </Link>
          )}
        </div>
      </div>

      <div className="class-tabs">
        <button className={`tab-btn ${activeTab === "stream" ? "active" : ""}`} onClick={() => setActiveTab("stream")}>
          Stream
        </button>
        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          Assignments
        </button>
        <button
          className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
      </div>

      <div className="class-content animate-fade-in">
        {activeTab === "stream" && <PostFeed classId={classId} isTeacher={isTeacher} />}

        {activeTab === "assignments" && (
          <AssignmentsContainer
            classId={classId}
            isTeacher={isTeacher}
            onUpdate={() => setNotification({ type: "success", message: "Updated!" })}
          />
        )}

        {activeTab === "members" && (
          <ViewMembers
            classId={classId}
            isTeacher={isTeacher}
            teacherName={classData.teacher_name}
            onRemove={() => {
              setNotification({ type: "success", message: "Student removed" })
            }}
          />
        )}
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
