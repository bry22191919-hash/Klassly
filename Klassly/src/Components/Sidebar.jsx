"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import { LayoutDashboard, Plus, UserPlus, User, Settings, LogOut, GraduationCap, Moon, Sun } from "lucide-react"

const API_URL = "http://localhost:5000"

export default function Sidebar({ onLogout, className = "", onNavigationClick }) {
  const { user, theme, toggleTheme } = useAuth()

  const teacherLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/create-class", icon: Plus, label: "Create Class" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ]

  const studentLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/join-class", icon: UserPlus, label: "Join Class" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ]

  const links = user?.role === "teacher" ? teacherLinks : studentLinks

  const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : null

  return (
    <aside className={`sidebar ${className}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={24} color="white" />
        </div>
        <span className="logo-text">Klassly</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {avatarUrl ? (
            <img src={avatarUrl || "/placeholder.svg"} alt={user?.name} />
          ) : (
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to} 
            to={to} 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onNavigationClick}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle and Logout */}
      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={() => {
          toggleTheme()
          onNavigationClick?.()
        }}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  )
}
