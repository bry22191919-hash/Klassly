import React, { useState } from 'react';

export default function CreatePostForm({ onCreate }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e && e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      onCreate(text.trim());
      setText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write an announcement..."
        style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 6, border: '1px solid #dadce0' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="submit" onClick={submit} disabled={loading} style={{ padding: '8px 12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 6 }}>
          {loading ? 'Posting…' : 'Post Announcement'}
        </button>
      </div>
    </form>
  );
}
