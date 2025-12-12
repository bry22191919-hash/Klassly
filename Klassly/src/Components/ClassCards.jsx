"use client"

import { Link } from "react-router-dom"
import { Users, BookOpen, Calendar } from "lucide-react"

export default function ClassCards({ classes, role }) {
  if (!classes?.length) {
    return (
      <div className="empty-state">
        <BookOpen className="empty-state-icon" />
        <h3 className="empty-state-title">{role === "teacher" ? "No classes yet" : "Not enrolled in any classes"}</h3>
        <p className="empty-state-description">
          {role === "teacher"
            ? "Create your first class to get started"
            : "Join a class using a class code from your teacher"}
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20,
      }}
    >
      {classes.map((cls, index) => (
        <Link key={cls.id} to={`/class/${cls.id}`} style={{ textDecoration: "none" }}>
          <div
            className="card animate-slide-up"
            style={{
              overflow: "hidden",
              cursor: "pointer",
              transition: "all var(--transition)",
              animationDelay: `${index * 0.1}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "var(--shadow-sm)"
            }}
          >
            {/* Color banner */}
            <div
              style={{
                height: 8,
                background: cls.color || "var(--primary)",
              }}
            />

            <div className="card-body">
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                {cls.name}
              </h3>

              {cls.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    marginBottom: 16,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cls.description}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                {role === "teacher" && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={16} />
                    {cls.student_count || 0} students
                  </span>
                )}
                {role === "student" && cls.teacher_name && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={16} />
                    {cls.teacher_name}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={16} />
                  {new Date(cls.created_at).toLocaleDateString()}
                </span>
              </div>

              {role === "teacher" && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "8px 12px",
                    background: "var(--background)",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Class Code</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "monospace",
                      color: "var(--primary)",
                    }}
                  >
                    {cls.code}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
