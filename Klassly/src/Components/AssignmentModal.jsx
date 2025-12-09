import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignmentModal = ({ assignment, user, onClose }) => {
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    if (user.role === "teacher") {
      const res = await axios.get(
        `http://localhost:3001/api/assignments/${assignment.id}/submissions`
      );
      setSubmissions(res.data);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div style={modal}>
      <div style={content}>
        <h2>{assignment.title}</h2>
        <p>{assignment.description}</p>

        {assignment.file && (
          <a
            href={`http://localhost:3001/uploads/${assignment.file}`}
            download
            style={{ display: "block", margin: "10px 0", color: "blue" }}
          >
            📄 Download Attached File
          </a>
        )}

        {/* Student upload form */}
        {user.role === "student" && <StudentSubmit assignmentId={assignment.id} />}

        {/* Teacher view submissions */}
        {user.role === "teacher" && (
          <TeacherSubmissions submissions={submissions} />
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Student Submit Component
const StudentSubmit = ({ assignmentId }) => {
  const [file, setFile] = useState(null);

  const submitWork = async () => {
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", localStorage.getItem("id"));

    await axios.post(
      `http://localhost:3001/api/assignments/${assignmentId}/submit`,
      form
    );

    alert("Submitted!");
  };

  return (
    <div>
      <h3>Submit Work</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={submitWork}>Upload</button>
    </div>
  );
};

// Teacher submissions table
const TeacherSubmissions = ({ submissions }) => (
  <div>
    <h3>Student Submissions</h3>

    {submissions.length === 0 ? (
      <p>No submissions yet.</p>
    ) : (
      <ul>
        {submissions.map((s) => (
          <li key={s.id}>
            {s.student_name} —{" "}
            <a
              href={`http://localhost:3001/uploads/${s.file}`}
              download
              style={{ color: "blue" }}
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const content = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "450px",
};

export default AssignmentModal;
