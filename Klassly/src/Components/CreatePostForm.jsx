import React, { useState } from "react";
import axios from "axios";

const CreatePostForm = ({ classId, onPostCreated }) => {
  const [content, setContent] = useState("");
  const userId = localStorage.getItem("id");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3001/api/class/${classId}/posts`,
        { user_id: userId, content }
      );
      onPostCreated({ ...res.data, replies: [] }); // initialize empty replies
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a post..."
        rows={3}
        style={{ width: "100%" }}
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePostForm;
