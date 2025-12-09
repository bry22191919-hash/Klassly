import React, { useState } from "react";
import axios from "axios";

const AssignmentForm = ({ classId, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);

  const createAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("due_date", dueDate);
    if (file) formData.append("file", file);

    await axios.post(
      `http://localhost:3001/api/class/${classId}/assignments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    onCreated();
    onClose();
  };

  return (
    <div style={modal}>
      <div style={content}>
        <h2>Create Assignment</h2>

        <form onSubmit={createAssignment}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          /><br />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
          /><br />

          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          /><br />

          <label>Attachment (Optional):</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} /><br />

          <button type="submit">Create</button>
          <button onClick={onClose} type="button">Cancel</button>
        </form>
      </div>
    </div>
  );
};

const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const content = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "350px",
};

export default AssignmentForm;
