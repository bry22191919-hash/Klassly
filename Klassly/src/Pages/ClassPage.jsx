import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ViewMembers from "../Components/ViewMembers";
import PostFeed from "../Components/PostFeed";

// Class header
const ClassHeader = ({ classData, onBackToDashboard }) => (
  <div style={{
    padding: "24px",
    borderBottom: "2px solid #e0e0e0",
    marginBottom: "24px",
    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  }}>
    <div>
      <h1 style={{
        margin: 0,
        fontSize: "28px",
        fontWeight: "700",
        color: "#2d3748",
        marginBottom: "16px"
      }}>
        {classData.name}
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{
          margin: 0,
          fontSize: "16px",
          color: "#4a5568",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>📚</span> <strong>Subject:</strong> {classData.subject}
        </p>
        <p style={{
          margin: 0,
          fontSize: "16px",
          color: "#4a5568",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>🔑</span> <strong>Class Code:</strong> {classData.class_code}
        </p>
        {classData.teacher_name && (
          <p style={{
            margin: 0,
            fontSize: "16px",
            color: "#4a5568",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>👨‍🏫</span> <strong>Teacher:</strong> {classData.teacher_name}
          </p>
        )}
      </div>
    </div>
    <button
      onClick={onBackToDashboard}
      style={{
        padding: "10px 16px",
        border: "1px solid #cbd5e0",
        borderRadius: "6px",
        background: "#ffffff",
        color: "#4a5568",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "#f7fafc";
        e.target.style.borderColor = "#a0aec0";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "#ffffff";
        e.target.style.borderColor = "#cbd5e0";
      }}
    >
      <span>←</span> Back to Dashboard
    </button>
  </div>
);

const ClassPage = () => {
  const { id } = useParams(); // class ID
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track which section is visible: "members" | "posts"
  const [activeSection, setActiveSection] = useState("members");

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/class/${id}`);
        if (!res.data) setError("Class not found");
        else setClassData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load class");
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  if (loading) return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #4CAF50",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ margin: 0, color: "#666" }}>Loading class...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        padding: "20px",
        background: "#fff3f3",
        border: "1px solid #ffcdd2",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "20px" }}>⚠️</span>
        <p style={{ margin: 0, color: "#c62828" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Class Header */}
      <ClassHeader classData={classData} onBackToDashboard={handleBackToDashboard} />

      {/* Section Selector */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        padding: "16px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e0e0e0"
      }}>
        <button
          onClick={() => setActiveSection("members")}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "6px",
            background: activeSection === "members" ? "#4CAF50" : "#ffffff",
            color: activeSection === "members" ? "#ffffff" : "#4a5568",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: activeSection === "members" ? "0 2px 4px rgba(76, 175, 80, 0.2)" : "none"
          }}
          onMouseEnter={(e) => {
            if (activeSection !== "members") {
              e.target.style.background = "#f1f3f5";
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== "members") {
              e.target.style.background = "#ffffff";
            }
          }}
        >
          View Members
        </button>
        <button
          onClick={() => setActiveSection("posts")}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "6px",
            background: activeSection === "posts" ? "#4CAF50" : "#ffffff",
            color: activeSection === "posts" ? "#ffffff" : "#4a5568",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: activeSection === "posts" ? "0 2px 4px rgba(76, 175, 80, 0.2)" : "none"
          }}
          onMouseEnter={(e) => {
            if (activeSection !== "posts") {
              e.target.style.background = "#f1f3f5";
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== "posts") {
              e.target.style.background = "#ffffff";
            }
          }}
        >
          Class Feed
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeSection === "members" && <ViewMembers classId={id} />}
      {activeSection === "posts" && <PostFeed classId={id} />}
    </div>
  );
};

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default ClassPage;