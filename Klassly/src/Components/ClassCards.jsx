import React from "react";

const ClassCard = ({ classData }) => {
  return (
    <div
      style={{
        width: "250px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        background: "#f9f9f9",
      }}
    >
      <h2>{classData.name}</h2>
      <p>{classData.description}</p>

      <button
        style={{ marginTop: "10px" }}
        onClick={() => (window.location.href = `/class/${classData.id}`)}
      >
        Open Class
      </button>
    </div>
  );
};

export default ClassCard;
