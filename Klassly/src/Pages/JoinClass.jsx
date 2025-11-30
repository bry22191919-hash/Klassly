import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinClass = () => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const storedId = localStorage.getItem("userId") ?? localStorage.getItem("id");
    const student_id = storedId ? Number(storedId) : null;
    if (!student_id) {
      setError("You must be logged in to join a class.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/join-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_code: classCode, student_id })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Joined class:", data);
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid class code.");
      }
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Join a Class</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter class code"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          style={{ padding: "10px", width: "200px", marginRight: "10px" }}
          required
        />

        <button type="submit">Join Class</button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default JoinClass;
