import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import ViewMembers from "../Components/ViewMembers";
import PostFeed from "../Components/PostFeed";
import AssignmentsContainer from "../Components/AssignmentsContainer";

// Class header component
const ClassPage = () => {
  const { id } = useParams(); // class ID
  const navigate = useNavigate();

  // from login
  const currentUser = {
    id: localStorage.getItem("userId"),
    role: localStorage.getItem("role"), // "teacher" or "student"
    name: localStorage.getItem("name"),
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser.id) {
      navigate("/login");
    }
  }, [currentUser.id, navigate]);

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (!currentUser.id) return null; // Don't render anything while redirecting

  if (loading) return <p style={{ padding: "20px" }}>Loading class...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <ClassHeader classData={classData} />

      {/* Navigation Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveSection("members")}
          style={{
            marginRight: "10px",
            fontWeight: activeSection === "members" ? "bold" : "normal",
          }}
        >
          Members
        </button>
        <button
          onClick={() => setActiveSection("posts")}
          style={{
            marginRight: "10px",
            fontWeight: activeSection === "posts" ? "bold" : "normal",
          }}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveSection("assignments")}
          style={{
            fontWeight: activeSection === "assignments" ? "bold" : "normal",
          }}
        >
          Assignments
        </button>
      </div>

      {activeSection === "members" && <ViewMembers classId={id} />}
      {activeSection === "posts" && <PostFeed classId={id} />}
      {activeSection === "assignments" && (
        <AssignmentsContainer classId={id} user={currentUser} />
      )}

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          padding: "10px 16px",
          borderRadius: "6px",
          border: "none",
          background: "#444",
          color: "white",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};


export default ClassPage;