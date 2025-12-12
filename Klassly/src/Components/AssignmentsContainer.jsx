"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Calendar, Clock, ChevronRight, Users } from "lucide-react"
import AssignmentForm from "./AssignmentForm"
import AssignmentModal from "./AssignmentModal"
import SubmissionModal from "./SubmissionModal"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function AssignmentsContainer({ classId, isTeacher }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionAssignment, setSubmissionAssignment] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [classId])

  async function fetchAssignments() {
    try {
      const res = await fetch(`${API_URL}/api/assignments/${classId}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setAssignments(data.assignments || [])
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleNewAssignment(assignment) {
    setAssignments([...assignments, assignment])
    setShowForm(false)
  }

  function handleDeleteAssignment(id) {
    setAssignments(assignments.filter((a) => a.id !== id))
    setSelectedAssignment(null)
  }

  function getStatus(assignment) {
    const now = new Date()
    const dueDate = new Date(assignment.due_date)

    if (assignment.submitted_at) {
      return { label: "Submitted", color: "var(--success)", badge: "badge-success" }
    }
    if (now > dueDate) {
      return { label: "Past Due", color: "var(--error)", badge: "badge-error" }
    }
    return { label: "Assigned", color: "var(--primary)", badge: "badge-primary" }
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
      {isTeacher && (
        <div style={{ marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            Create Assignment
          </button>
        </div>
      )}

      {showForm && (
        <AssignmentForm classId={classId} onClose={() => setShowForm(false)} onCreated={handleNewAssignment} />
      )}

      {assignments.length === 0 ? (
        <div className="card empty-state">
          <FileText className="empty-state-icon" />
          <h3 className="empty-state-title">No assignments yet</h3>
          <p className="empty-state-description">
            {isTeacher
              ? "Create your first assignment for this class"
              : "Your teacher hasn't posted any assignments yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.map((assignment, index) => {
            const status = getStatus(assignment)

            return (
              <div
                key={assignment.id}
                className="card animate-slide-up"
                style={{
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  animationDelay: `${index * 0.05}s`,
                }}
                onClick={() => (isTeacher ? setSelectedAssignment(assignment) : setSubmissionAssignment(assignment))}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)"
                  e.currentTarget.style.borderColor = "var(--primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)"
                  e.currentTarget.style.borderColor = "var(--border)"
                }}
              >
                <div className="card-body" style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "var(--radius)",
                          background: `${status.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={22} color={status.color} />
                      </div>

                      <div>
                        <h4
                          style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: 15,
                          }}
                        >
                          {assignment.title}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontSize: 13,
                            color: "var(--text-muted)",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={14} />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={14} />
                            {new Date(assignment.due_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isTeacher && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Users size={14} />
                              {assignment.submission_count || 0}/{assignment.student_count || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                      <ChevronRight size={20} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onDelete={handleDeleteAssignment}
        />
      )}

      {submissionAssignment && (
        <SubmissionModal
          assignment={submissionAssignment}
          onClose={() => setSubmissionAssignment(null)}
          onSubmitted={() => {
            fetchAssignments()
            setSubmissionAssignment(null)
          }}
        />
      )}
    </div>
  )
}
