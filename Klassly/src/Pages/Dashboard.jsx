"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import ClassCards from "../Components/ClassCards"
import TodoList from "../Components/TodoList"
import LoadingSpinner from "../Components/LoadingSpinner"
import Notification from "../Components/Notification"
import "../App.css"

const API_URL = "http://localhost:5000"

export default function Dashboard() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [upcomingAssignments, setUpcomingAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  async function fetchData() {
    if (!user) return

    try {
      setLoading(true)
      const classesRes = await fetch(`${API_URL}/api/classes`, { credentials: "include" })
      const classesData = await classesRes.json()

      if (classesRes.ok) {
        setClasses(classesData.classes || [])
      }

      if (user.role === "student") {
        const assignmentsRes = await fetch(`${API_URL}/api/assignments/upcoming`, { credentials: "include" })
        const assignmentsData = await assignmentsRes.json()
        if (assignmentsRes.ok) {
          setUpcomingAssignments(assignmentsData.assignments || [])
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setNotification({ type: "error", message: "Failed to load data" })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header animate-fade-in">
        <div>
          <h1 className="dashboard-title">Welcome back, {user.name}!</h1>
          <p className="dashboard-subtitle">
            {user.role === "teacher"
              ? `You have ${classes.length} class${classes.length !== 1 ? "es" : ""}`
              : `You're enrolled in ${classes.length} class${classes.length !== 1 ? "es" : ""}`}
          </p>
        </div>
        <Link to={user.role === "teacher" ? "/create-class" : "/join-class"} className="btn btn-primary">
          {user.role === "teacher" ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Class
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Join Class
            </>
          )}
        </Link>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <section className="dashboard-section animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="section-title">Your Classes</h2>
            {classes.length > 0 ? (
              <ClassCards classes={classes} role={user.role} />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h3>No classes yet</h3>
                <p>
                  {user.role === "teacher"
                    ? "Create your first class to get started"
                    : "Join a class using a class code"}
                </p>
                <Link to={user.role === "teacher" ? "/create-class" : "/join-class"} className="btn btn-primary">
                  {user.role === "teacher" ? "Create Class" : "Join Class"}
                </Link>
              </div>
            )}
          </section>

          {user.role === "student" && upcomingAssignments.length > 0 && (
            <section className="dashboard-section animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="section-title">Upcoming Assignments</h2>
              <div className="upcoming-assignments">
                {upcomingAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    to={`/class/${assignment.class_id}`}
                    className="upcoming-card"
                    style={{ borderLeftColor: assignment.class_color }}
                  >
                    <div className="upcoming-info">
                      <h4>{assignment.title}</h4>
                      <p className="upcoming-class">{assignment.class_name}</p>
                    </div>
                    <div className="upcoming-due">
                      <span
                        className={`due-badge ${new Date(assignment.due_date) < new Date(Date.now() + 86400000) ? "due-soon" : ""}`}
                      >
                        Due {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      {assignment.submission_id && <span className="submitted-badge">Submitted</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="dashboard-sidebar animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <TodoList />
        </aside>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
