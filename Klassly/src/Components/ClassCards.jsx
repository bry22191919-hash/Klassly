import React from "react";
import { useNavigate } from "react-router-dom";

const ClassCard = ({ classData }) => {
  const navigate = useNavigate();

  const openClass = () => navigate(`/class/${classData.id}`);
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openClass();
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': '#3b82f6',
      'Physics': '#a855f7', 
      'English': '#10b981',
      'Computer Science': '#f97316',
      'CS': '#f97316'
    };
    return colors[subject] || '#6b7280';
  };

  const teacherLabel =
    classData.teacher_name && classData.teacher_name.trim()
      ? classData.teacher_name
      : classData.teacher_id && classData.teacher_id === Number(localStorage.getItem("userId") ?? localStorage.getItem("id"))
      ? "You"
      : `Teacher #${classData.teacher_id ?? "?"}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openClass}
      onKeyDown={handleKeyDown}
      aria-label={`Open class ${classData.name}`}
      style={{
        width: "280px",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        background: "white",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        marginBottom: "24px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
      }}
    >
      {/* Colored top section */}
      <div 
        style={{
          height: "120px",
          background: getSubjectColor(classData.subject),
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        }}
      >
        <h2 
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "600",
            color: "white",
            marginBottom: "8px",
            lineHeight: "1.3"
          }}
        >
          {classData.name}
        </h2>
        <p 
          style={{
            margin: 0,
            fontSize: "15px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          {classData.subject}
        </p>
      </div>
      
      {/* White bottom section */}
      <div style={{ padding: "20px" }}>
        <p 
          style={{
            margin: 0,
            fontSize: "15px",
            color: "#4a5568",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px"
          }}
        >
          <span>👨‍🏫</span> {teacherLabel}
        </p>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          marginTop: "16px"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            color: "#6b7280"
          }}>
            <i className="fas fa-users"></i>
            <span>{classData.students}</span>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            color: "#6b7280"
          }}>
            <i className="fas fa-file-alt"></i>
            <span>{classData.assignments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;