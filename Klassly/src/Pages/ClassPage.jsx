import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ViewMembers from "../Components/ViewMembers";
import PostFeed from "../Components/PostFeed";

// Class header
const ClassHeader = ({ classData }) => (
  <div style={{
    padding: "20px",
    borderBottom: "2px solid #ddd",
    marginBottom: "20px",
    background: "#f7f7f7",
    borderRadius: "8px"
  }}>
    <h1>{classData.name}</h1>
    <p><strong>Subject:</strong> {classData.subject}</p>
    <p><strong>Class Code:</strong> {classData.class_code}</p>
    {classData.teacher_name && <p><strong>Teacher:</strong> {classData.teacher_name}</p>}
  </div>
);

const ClassPage = () => {
  const { id } = useParams(); // class ID
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track which section is visible: "members" | "posts"
  const [activeSection, setActiveSection] = useState("members");

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

  if (loading) return <p style={{ padding: "20px" }}>Loading class...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Class Header */}
      <ClassHeader classData={classData} />

      {/* Section Selector */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveSection("members")}
          style={{ marginRight: "10px", fontWeight: activeSection === "members" ? "bold" : "normal" }}
        >
          View Members
        </button>
        <button
          onClick={() => setActiveSection("posts")}
          style={{ fontWeight: activeSection === "posts" ? "bold" : "normal" }}
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

export default ClassPage;
