import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewMembers = ({ classId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`http://localhost:3001/api/class/${classId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setError("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [classId]);

  if (loading) return <p>Loading members...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (members.length === 0) return <p>No students yet.</p>;

  return (
    <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
      {members.map((m) => (
        <li key={m.user_id}>{m.name}</li>
      ))}
    </ul>
  );
};

export default ViewMembers;
