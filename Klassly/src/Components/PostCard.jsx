import React, { useState } from "react";
import CommentsForm from "./CommentsForm";
import axios from "axios";

const PostCard = ({ post, currentUser, onCommentAdded }) => {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleComment = async (content) => {
    try {
      const res = await axios.post(
        `http://localhost:3001/api/posts/${post.id}/comments`,
        { user_id: currentUser.id, content }
      );
      onCommentAdded(post.id, res.data); // add comment to parent post
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
      <p><strong>{post.user_name}</strong>: {post.content}</p>

      <button onClick={() => setShowCommentForm((prev) => !prev)}>
        {showCommentForm ? "Cancel" : "Comment"}
      </button>

      {showCommentForm && <CommentsForm onSubmit={handleComment} />}

      {post.replies && post.replies.length > 0 && (
        <div style={{ marginLeft: "20px", marginTop: "10px" }}>
          {post.replies.map((c) => (
            <p key={c.id}><strong>{c.user_name}</strong>: {c.content}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
