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

  const localId = Number(localStorage.getItem("userId") ?? localStorage.getItem("id"));
  const teacherLabel =
    classData.teacher_name && classData.teacher_name.trim()
      ? classData.teacher_name
      : classData.teacher_id && classData.teacher_id === localId
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
        width: "250px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        background: "#f9f9f9",
        cursor: "pointer",
        userSelect: "none"
      }}
    >
      <h2>{classData.name}</h2>
      <p>Subject: {classData.subject}</p>
      <p>Class Code: {classData.class_code}</p>
      <p>Teacher: {teacherLabel}</p>
    </div>
  );
};

export default ClassCard;
