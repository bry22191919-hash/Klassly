import React, { useState } from "react";

const CommentsForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        style={{ width: "80%" }}
      />
      <button type="submit">Comment</button>
    </form>
  );
};

export default CommentsForm;