import React, { useState } from 'react';

const CreateCommentForm = ({ onSubmitComment, onCancel, placeholder }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitComment(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || "Write a comment..."}
        rows="2"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">Reply</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default CreateCommentForm;