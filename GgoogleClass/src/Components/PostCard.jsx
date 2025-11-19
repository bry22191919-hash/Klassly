import React, { useState } from 'react';
import CommentList from './CommentList';

export default function PostCard({ post, onReply }) {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await onReply(commentText.trim());
      setCommentText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <strong>{post.authorName}</strong>
          <div style={{ color: '#777', fontSize: 12 }}>{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ color: '#5f6368', fontSize: 12 }}>{post.role}</div>
      </div>
      <div style={{ marginBottom: 10 }}>{post.content}</div>

      <div style={{ marginTop: 8 }}>
        <div style={{ color: '#5f6368', fontSize: 13, marginBottom: 8 }}>{(post.comments || []).length} comment(s)</div>

        <CommentList comments={post.comments || []} />

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #dadce0' }}
          />
          <button onClick={submitComment} disabled={loading} style={{ padding: '8px 12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 6 }}>
            {loading ? 'Replying…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
