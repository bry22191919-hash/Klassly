"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Briefcase, BookOpen, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../Components/LoadingSpinner"
import PasswordStrength from "../Components/PasswordStrength"

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!role) {
      setError("Please select your role")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, name, role)
      navigate("/login")
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--background)",
        position: "relative",
      }}
    >
      <Link
        to="/"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 500,
          padding: "8px 16px",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          transition: "all var(--transition)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary)"
          e.currentTarget.style.color = "white"
          e.currentTarget.style.borderColor = "var(--primary)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--surface)"
          e.currentTarget.style.color = "var(--text-secondary)"
          e.currentTarget.style.borderColor = "var(--border)"
        }}
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div
        className="animate-scale-in"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          padding: 32,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Join Klassly to start managing your classroom</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 10,
              }}
            >
              I am a...
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 20,
                  background: role === "teacher" ? "rgba(79, 70, 229, 0.1)" : "var(--background)",
                  border: `2px solid ${role === "teacher" ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "all var(--transition)",
                }}
              >
                <Briefcase size={28} color={role === "teacher" ? "var(--primary)" : "var(--text-muted)"} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: role === "teacher" ? "var(--primary)" : "var(--text-secondary)",
                  }}
                >
                  Teacher
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("student")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 20,
                  background: role === "student" ? "rgba(79, 70, 229, 0.1)" : "var(--background)",
                  border: `2px solid ${role === "student" ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "all var(--transition)",
                }}
              >
                <BookOpen size={28} color={role === "student" ? "var(--primary)" : "var(--text-muted)"} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: role === "student" ? "var(--primary)" : "var(--text-secondary)",
                  }}
                >
                  Student
                </span>
              </button>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Full Name</label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: 42, width: "100%" }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Email</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 42, width: "100%" }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 42, paddingRight: 42, width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="input-group" style={{ marginBottom: 24 }}>
            <label>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingLeft: 42, width: "100%" }}
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p style={{ color: "var(--error)", fontSize: 12, marginTop: 6 }}>Passwords do not match</p>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--error)",
                borderRadius: "var(--radius)",
                marginBottom: 16,
              }}
            >
              <p style={{ color: "var(--error)", fontSize: 14 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%", marginBottom: 16 }}
          >
            {loading ? <LoadingSpinner size="small" /> : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
