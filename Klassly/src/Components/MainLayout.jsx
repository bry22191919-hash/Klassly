"use client"

import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"
import LogoutDialog from "./LogoutDialog"

export default function MainLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
      navigate("/login")
    } finally {
      setLoggingOut(false)
      setShowLogout(false)
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar 
        onLogout={() => {
          setShowLogout(true)
          setSidebarOpen(false)
        }} 
        className={sidebarOpen ? "open" : ""}
        onNavigationClick={() => setSidebarOpen(false)}
      />
      
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: 24,
          background: "var(--background)",
        }}
        className="main-content"
      >
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 50
          }}
        >
          <Menu size={24} />
        </button>
        
        <div style={{ paddingTop: '60px' }}>
          <Outlet />
        </div>
      </main>

      <LogoutDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </div>
  )
}
