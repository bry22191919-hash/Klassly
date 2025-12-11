import React, { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import CreatePostForm from "./CreatePostForm";

const PostFeed = ({ classId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = {
    id: localStorage.getItem("id"),
    role: localStorage.getItem("role")
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:3001/api/class/${classId}/posts`);
        // Map comments from backend to replies for frontend
        const postsWithComments = res.data.map((post) => ({
          ...post,
          replies: post.comments || []
        }));
        setPosts(postsWithComments);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [classId]);

  const addPost = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const addComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, replies: [...post.replies, comment] } : post
      )
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        marginTop: "20px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e0e0e0",
            borderTop: "4px solid #4CAF50",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ margin: 0, color: "#666" }}>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: "20px", padding: "20px", display: "flex", justifyContent: "center" }}>
        <div style={{
          padding: "20px",
          background: "#fff3f3",
          border: "1px solid #ffcdd2",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <p style={{ margin: 0, color: "#c62828" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Create Post Form */}
      {currentUser.role === "teacher" && (
        <div style={{ 
          marginBottom: "24px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "12px",
          border: "1px solid #e0e0e0"
        }}>
          <CreatePostForm classId={classId} onPostCreated={addPost} />
        </div>
      )}

      {/* Posts Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {posts.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e0e0e0"
          }}>
            <p style={{ 
              fontSize: "18px", 
              color: "#4a5568",
              marginBottom: "8px"
            }}>
              No posts yet
            </p>
            <p style={{ 
              fontSize: "14px", 
              color: "#718096"
            }}>
              Be the first to share something!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onCommentAdded={addComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default PostFeed;