import React, { useState } from 'react';

const CreatePostForm = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost = {
      id: Date.now(),
      content: content,
      user: { name: userName, role: role },
      timestamp: new Date(),
      allowComments: true,
      comments: [],
      likes: 0, // NEW: Initialize likes
      likedBy: [], // NEW: Initialize list of users who liked the post
    };

    onCreatePost(newPost);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Create a New Post</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows="3"
        style={{ width: '95%', padding: '0.5rem', marginBottom: '0.5rem' }}
      />
      <br />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePostForm;