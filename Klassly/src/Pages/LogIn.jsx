"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../Components/LoadingSpinner"

export default function LogIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.")
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
          maxWidth: 420,
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sign in to your Klassly account</p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div className="input-group" style={{ marginBottom: 24 }}>
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
                placeholder="Enter your password"
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
            {loading ? <LoadingSpinner size="small" /> : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
