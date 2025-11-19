import React, { useEffect, useState } from 'react';
import CreatePostForm from './CreatePostForm';
import PostCard from './PostCard';

export default function ViewClassModal({
  isOpen,
  onClose,
  classItem,
  user,
  isTeacher,
  loadPostsForClass,
  createPostForClass,
  addCommentToPost
}) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!isOpen || !classItem) return;
    setPosts(loadPostsForClass(classItem.id) || []);
  }, [isOpen, classItem, loadPostsForClass]);

  const handleCreate = (content) => {
    const post = createPostForClass(classItem.id, {
      content,
      authorId: user.id,
      authorName: user.name || user.email,
      role: user.role || 'teacher'
    });
    setPosts(prev => [post, ...prev]);
  };

  const handleComment = (postId, text) => {
    const comment = addCommentToPost(classItem.id, postId, {
      authorId: user.id,
      authorName: user.name || user.email,
      content: text
    });
    if (!comment) return null;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments||[]), comment] } : p));
    return comment;
  };

  if (!isOpen || !classItem) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalStyle, maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{classItem.name} — Announcements</h3>
          <div>
            <button onClick={onClose} style={cancelButtonStyle}>Close</button>
          </div>
        </div>

        {isTeacher && <CreatePostForm onCreate={handleCreate} />}

        <div>
          {posts.length === 0 && <div style={{ padding: 20, color: '#5f6368' }}>No announcements yet.</div>}
          {posts.map(post => (
            <PostCard key={post.id} post={post} onReply={(text) => handleComment(post.id, text)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Minimal styles (reuse Dashboard styles where appropriate)
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = { backgroundColor: 'white', padding: 24, borderRadius: 8, width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const cancelButtonStyle = { padding: '6px 10px', borderRadius: 6, border: '1px solid #dadce0', background: '#f1f3f4', cursor: 'pointer' };
