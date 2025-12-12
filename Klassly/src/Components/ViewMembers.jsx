"use client"

import { useState, useEffect } from "react"
import { UserMinus, Copy, Check, Crown } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function ViewMembers({ classId, isTeacher, teacherName, onRemove }) {
  const [students, setStudents] = useState([])
  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    fetchData()
  }, [classId])

  async function fetchData() {
    try {
      const [studentsRes, classRes] = await Promise.all([
        fetch(`${API_URL}/api/classes/${classId}/students`, { credentials: "include" }),
        fetch(`${API_URL}/api/classes/${classId}`, { credentials: "include" }),
      ])

      const studentsData = await studentsRes.json()
      const classDataRes = await classRes.json()

      if (studentsRes.ok) setStudents(studentsData.students)
      if (classRes.ok) setClassData(classDataRes.class)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function removeStudent(studentId) {
    if (!confirm("Remove this student from the class?")) return

    setRemoving(studentId)
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}/students/${studentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        setStudents(students.filter((s) => s.id !== studentId))
        onRemove?.()
      }
    } catch (error) {
      console.error("Failed to remove student:", error)
    } finally {
      setRemoving(null)
    }
  }

  function copyCode() {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function renderAvatar(user, size = 40) {
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

    if (user.avatar) {
      return (
        <div style={style}>
          <img
            src={`${API_URL}${user.avatar}`}
            alt={user.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )
    }

    return <div style={style}>{(user.name || "U").charAt(0).toUpperCase()}</div>
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
      {isTeacher && classData?.code && (
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
            Share this code with students to join your class:
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                padding: "14px 18px",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "monospace",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 4,
                color: "var(--primary)",
                textAlign: "center",
              }}
            >
              {classData.code}
            </div>
            <button className="btn btn-secondary" onClick={copyCode}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Teacher</h3>
        </div>
        <div className="card-body" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {classData?.teacher_avatar ? (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`${API_URL}${classData.teacher_avatar}`}
                  alt={classData.teacher_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {(teacherName || classData?.teacher_name)?.charAt(0).toUpperCase() || "T"}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{teacherName || classData?.teacher_name || "Teacher"}</p>
              <span className="badge badge-primary" style={{ marginTop: 4 }}>
                <Crown size={12} style={{ marginRight: 4 }} />
                Instructor
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Students</h3>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{students.length} enrolled</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {students.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <p>No students enrolled yet</p>
              {isTeacher && <p style={{ fontSize: 13, marginTop: 8 }}>Share your class code to invite students</p>}
            </div>
          ) : (
            <div>
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="animate-slide-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: index < students.length - 1 ? "1px solid var(--border)" : "none",
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {renderAvatar(student, 40)}
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{student.email}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Joined {new Date(student.joined_at).toLocaleDateString()}
                    </span>
                    {isTeacher && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeStudent(student.id)}
                        disabled={removing === student.id}
                        style={{ color: "var(--error)" }}
                      >
                        <UserMinus size={16} />
                      </button>
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
