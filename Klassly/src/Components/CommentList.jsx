import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostForm from '../Components/CreatePostForm';
import PostCard from '../Components/PostCard';
import ViewClassModal from '../Components/ViewClassModal';

const TestPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Get user info from localStorage
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName"); // Assuming you store the name on login
  const role = localStorage.getItem("role");

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!userId || !role) {
      navigate('/login');
    }
  }, [userId, role, navigate]);

  const handleCreatePost = (newPost) => {
    // The newPost object is now fully formed in CreatePostForm
    setPosts([newPost]);
  };

  const handleAddComment = (postId, parentCommentId, content) => {
    const newComment = {
      id: Date.now(),
      content: content,
      user: { name: userName, role: role, id: userId },
      timestamp: new Date(),
      replies: [],
      likes: 0,
      likedBy: [],
    };

    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id !== postId) return post;
        const addReplyRecursive = (comments) => {
          return comments.map(comment => {
            if (comment.id === parentCommentId) {
              return { ...comment, replies: [...comment.replies, newComment] };
            }
            if (comment.replies.length > 0) {
              return { ...comment, replies: addReplyRecursive(comment.replies) };
            }
            return comment;
          });
        };
        if (parentCommentId === null) {
          return { ...post, comments: [...post.comments, newComment] };
        } else {
          return { ...post, comments: addReplyRecursive(post.comments) };
        }
      })
    );
    setReplyingTo(null);
  };

  const handleLikeComment = (postId, commentId) => {
    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id !== postId) return post;
        const updateLikesRecursive = (comments) => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const hasLiked = comment.likedBy.includes(userId);
              return {
                ...comment,
                likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
                likedBy: hasLiked
                  ? comment.likedBy.filter(id => id !== userId)
                  : [...comment.likedBy, userId],
              };
            }
            if (comment.replies.length > 0) {
              return { ...comment, replies: updateLikesRecursive(comment.replies) };
            }
            return comment;
          });
        };
        return { ...post, comments: updateLikesRecursive(post.comments) };
      })
    );
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <h1>Classroom Feed</h1>
      <button onClick={openModal} style={{ marginBottom: '2rem' }}>Open View Class Modal</button>

      {/* Only show the create form if the user is a teacher */}
      {role === 'teacher' && <CreatePostForm onCreatePost={handleCreatePost} />}

      <div>
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet. The teacher needs to create one!</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserRole={role}
              currentUserId={userId}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
            />
          ))
        )}
      </div>
      <ViewClassModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default TestPage;