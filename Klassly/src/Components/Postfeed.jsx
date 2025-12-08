import React, { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import CreatePostForm from "./CreatePostForm";

const PostFeed = ({ classId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = {
    id: localStorage.getItem("id"),
    role: localStorage.getItem("role")
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/class/${classId}/posts`);
        // Map comments from backend to replies for frontend
        const postsWithComments = res.data.map((post) => ({
          ...post,
          replies: post.comments || []
        }));
        setPosts(postsWithComments);
      } catch (err) {
        console.error(err);
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

  if (loading) return <p>Loading posts...</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      {currentUser.role === "teacher" && (
        <CreatePostForm classId={classId} onPostCreated={addPost} />
      )}

      {posts.length === 0 ? (
        <p>No posts yet.</p>
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
  );
};

export default PostFeed;
