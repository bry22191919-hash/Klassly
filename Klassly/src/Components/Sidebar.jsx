import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current user info from localStorage
  const userId = localStorage.getItem("id") || localStorage.getItem("userId") || "1";
  const role = localStorage.getItem("role") || "Teacher";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Determine if a menu item is active based on current location
  const isActive = (path) => {
    // For dynamic routes like /profile/1
    if (path.includes('/:')) {
      const basePath = path.split('/:')[0];
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  };

  return (
    <div 
      style={{
        width: "240px",
        background: "#ffffff",
        borderRight: "1px solid #e0e0e0",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      {/* Logo/Brand */}
      <div 
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid #f0f0f0"
        }}
      >
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "#667eea",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "bold",
          color: "white"
        }}>
          <i className="fas fa-book"></i>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", color: "#2d3748", fontWeight: "600" }}>Klassly</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>{role}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        <div style={{ padding: "0 16px" }}>
          {/* Dashboard - highlighted when active */}
          <Link 
            to="/dashboard" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 16px", 
              textDecoration: "none", 
              color: isActive("/dashboard") ? "#667eea" : "#4a5568", 
              borderRadius: "8px", 
              marginBottom: "8px",
              background: isActive("/dashboard") ? "#e6f0ff" : "transparent",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </Link>

          {/* Create Class */}
          <Link 
            to="/create-class" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 16px", 
              textDecoration: "none", 
              color: "#4a5568", 
              borderRadius: "8px", 
              marginBottom: "8px",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-plus"></i>
            <span>Create Class</span>
          </Link>

          {/* Profile - highlighted when active */}
          <Link 
            to={`/profile/${userId}`}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 16px", 
              textDecoration: "none", 
              color: isActive(`/profile/${userId}`) ? "#667eea" : "#4a5568", 
              borderRadius: "8px", 
              marginBottom: "8px",
              background: isActive(`/profile/${userId}`) ? "#e6f0ff" : "transparent",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>

          {/* Settings */}
          <Link 
            to="/settings" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 16px", 
              textDecoration: "none", 
              color: "#4a5568", 
              borderRadius: "8px",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Logout Button - removed user profile section */}
      <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
        <button 
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "10px 16px",
            margin: "16px 0 0 0",
            background: "transparent",
            border: "none",
            color: "#4a5568",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;