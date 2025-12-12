"use client"

import { useMemo } from "react"

export default function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }

    let score = 0

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { score, label: "Weak", color: "var(--error)" }
    if (score <= 4) return { score, label: "Medium", color: "var(--warning)" }
    return { score, label: "Strong", color: "var(--success)" }
  }, [password])

  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= strength.score ? strength.color : "var(--border)",
              transition: "all 0.3s ease",
              boxShadow: i <= strength.score ? `0 0 8px ${strength.color}` : "none",
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: 12,
          color: strength.color,
          fontWeight: 500,
        }}
      >
        {strength.label}
      </p>
    </div>
  )
}
