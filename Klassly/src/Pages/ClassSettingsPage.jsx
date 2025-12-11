import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ClassSettingsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    subject: "",
    code: "",
    description: ""
  });
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const [classRes, membersRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/class/${classId}`),
          axios.get(`http://localhost:3001/api/class/${classId}/members`)
        ]);
        
        setClassData(classRes.data);
        setMembers(membersRes.data);
        setEditForm({
          name: classRes.data.name,
          subject: classRes.data.subject,
          code: classRes.data.code,
          description: classRes.data.description || ""
        });
      } catch (err) {
        setError("Failed to load class data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/class/${classId}`,
        editForm
      );
      setClassData({ ...classData, ...editForm });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update class settings");
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: classData.name,
      subject: classData.subject,
      code: classData.code,
      description: classData.description || ""
    });
    setIsEditing(false);
  };

  const handleDeleteClass = async () => {
    if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3001/api/class/${classId}`);
        navigate("/dashboard");
      } catch (err) {
        setError("Failed to delete class");
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#718096" }}>Loading class settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
        <div style={{ fontSize: "18px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", color: "#2d3748", marginBottom: "24px" }}>Class Settings</h1>
      
      {/* Class Information Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748" }}>Class Information</h2>
          <button
            onClick={handleEditToggle}
            style={{
              padding: "8px 16px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              background: "#f7fafc",
              color: "#4a5568",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#edf2f7";
              e.target.style.borderColor = "#a0aec0";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#f7fafc";
              e.target.style.borderColor = "#cbd5e0";
            }}
          >
            {isEditing ? "Cancel" : "Edit Settings"}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div style={{ marginTop: "20px", padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Class Name"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <input
                type="text"
                name="subject"
                value={editForm.subject}
                onChange={handleEditChange}
                placeholder="Subject"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <input
                type="text"
                name="code"
                value={editForm.code}
                onChange={handleEditChange}
                placeholder="Class Code"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Description (optional)"
                rows={3}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSaveSettings}
                  style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: "8px 16px",
                    background: "#f7fafc",
                    color: "#4a5568",
                    border: "1px solid #cbd5e0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Class Details Display */}
        {!isEditing && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Class Name</p>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748", fontWeight: "500" }}>{classData.name}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Subject</p>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748", fontWeight: "500" }}>{classData.subject}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Class Code</p>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748", fontWeight: "500" }}>{classData.code}</p>
            </div>
            {classData.description && (
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Description</p>
                <p style={{ margin: 0, fontSize: "16px", color: "#2d3748", fontWeight: "500" }}>{classData.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Members Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748", marginBottom: "16px" }}>Class Members</h2>
        
        {members.length > 0 ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {members.map(member => (
              <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "6px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#4a5568"
                }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#2d3748", fontWeight: "500" }}>{member.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>{member.role}</p>
                </div>
                {member.role !== "teacher" && (
                  <button
                    style={{
                      padding: "6px 12px",
                      background: "#fee2e2",
                      color: "#ef4444",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#718096", textAlign: "center", padding: "20px" }}>No members in this class yet.</p>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748", marginBottom: "16px" }}>Danger Zone</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "16px" }}>
          Once you delete a class, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteClass}
          style={{
            padding: "10px 20px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Delete Class
        </button>
      </div>
    </div>
  );
};

export default ClassSettingsPage;