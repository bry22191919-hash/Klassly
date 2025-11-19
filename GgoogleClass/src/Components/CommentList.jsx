import React from 'react';

export default function CommentList({ comments }) {
  if (!comments || comments.length === 0) return null;
  return (
    <div>
      {comments.map(c => (
        <div key={c.id} style={{ padding: '8px 10px', background: '#fafafa', borderRadius: 6, marginBottom: 6 }}>
          <div style={{ fontSize: 13 }}><strong>{c.authorName}</strong> <span style={{ color: '#666', fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span></div>
          <div style={{ color: '#333', marginTop: 4 }}>{c.content}</div>
        </div>
      ))}
    </div>
  );
}
