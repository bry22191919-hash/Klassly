"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

const API_URL = "http://localhost:5000"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("klassly-theme", theme)
  }, [theme])

  async function checkAuth() {
    try {
      // Load theme from localStorage
      const savedTheme = localStorage.getItem("klassly-theme") || "light"
      setTheme(savedTheme)

      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        if (data.user.theme) {
          setTheme(data.user.theme)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const res = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Sign in failed")
    }

    setUser(data.user)
    if (data.user.theme) {
      setTheme(data.user.theme)
    }
    return data.user
  }

  async function signUp(email, password, name, role) {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Sign up failed")
    }

    setUser(data.user)
    return data.user
  }

  async function signOut() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
    // Always clear user state regardless of API response
    setUser(null)
    localStorage.removeItem("klassly-theme")
    localStorage.removeItem("klassly-user")
  }

  async function updateProfile(formData) {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Update failed")
    }

    setUser(data.user)
    if (data.user.theme) {
      setTheme(data.user.theme)
    }
    return data.user
  }

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    // Also update on server if logged in
    if (user) {
      const formData = new FormData()
      formData.append("name", user.name)
      formData.append("theme", newTheme)
      fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      }).catch(console.error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        signIn,
        signUp,
        signOut,
        updateProfile,
        toggleTheme,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
