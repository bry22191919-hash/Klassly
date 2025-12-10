import React, { useState, useEffect } from "react";
import axios from "axios";
import AssignmentForm from "./AssignmentForm";
import AssignmentModal from "./AssignmentModal";

const AssignmentsContainer = ({ classId, user }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Load assignments
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/class/${classId}/assignments`
      );
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const openAssignment = (assignment) => setSelectedAssignment(assignment);

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div>
      {/* Teacher Create Button */}
      {user.role === "teacher" && (
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "5px",
            border: "none",
            marginBottom: "15px",
          }}
        >
          + Create Assignment
        </button>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <p>No assignments yet.</p>
      ) : (
        <div>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "12px",
                cursor: "pointer",
                background: "#fafafa",
              }}
              onClick={() => openAssignment(assignment)}
            >
              <h3>{assignment.title}</h3>
              <p>{assignment.description}</p>
              <p>
                <strong>Due:</strong> {formatDate(assignment.due_date)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Assignment Creator */}
      {showCreateModal && (
        <AssignmentForm
          classId={classId}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchAssignments}
        />
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          user={user}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

export default AssignmentsContainer;
