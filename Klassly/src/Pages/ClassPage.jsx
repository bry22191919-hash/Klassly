import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  // --- STATE MANAGEMENT ---
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [classInfo, setClassInfo] = useState(null);

  // --- USER INFO ---
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");

  // --- EFFECTS ---
  useEffect(() => {
    if (!userId || !role) {
      navigate('/login');
    }
  }, [userId, role, navigate]);

  // --- FIXED: This effect now fetches REAL data from localStorage ---
  useEffect(() => {
    const allClasses = JSON.parse(localStorage.getItem('classes')) || [];
    // We use Number(classId) because the ID from the URL is a string, but we saved it as a number
    const currentClass = allClasses.find(c => c.id === Number(classId));

    if (currentClass) {
      setClassInfo(currentClass); // Set the full class object
    } else {
      // Fallback if the class isn't found (e.g., from an old link)
      setClassInfo({ name: `Class ID: ${classId}`, section: 'N/A', subject: 'N/A', teacherName: 'N/A' });
    }

    setPosts([]); // Start with no posts for the class
  }, [classId]);

  // --- HANDLER FUNCTIONS ---
  const handleCreatePost = (newPost) => {
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

  const handleLikePost = (postId) => {
    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          const hasLiked = post.likedBy.includes(userId);
          return {
            ...post,
            likes: hasLiked ? post.likes - 1 : post.likes + 1,
            likedBy: hasLiked
              ? post.likedBy.filter(id => id !== userId)
              : [...post.likedBy, userId],
          };
        }
        return post;
      })
    );
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

  // --- INTERNAL COMPONENTS ---
  const ViewClassModal = ({ isOpen, onClose, classInfo }) => {
    if (!isOpen) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
          <h2>Class Information</h2>
          {classInfo && (
            <>
              <p><strong>Class Name:</strong> {classInfo.name}</p>
              <p><strong>Subject:</strong> {classInfo.subject}</p>
              <p><strong>Section:</strong> {classInfo.section}</p>
              <p><strong>Instructor:</strong> {classInfo.teacherName}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  const CreateCommentForm = ({ onSubmitComment, onCancel, placeholder }) => {
    const [content, setContent] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (!content.trim()) return; onSubmitComment(content); setContent(''); };
    return (
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder || "Write a comment..."} rows="2" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <div style={{ display: 'flex', gap: '10px' }}><button type="submit">Reply</button>{onCancel && <button type="button" onClick={onCancel}>Cancel</button>}</div>
      </form>
    );
  };

  const CommentList = ({ comments, postId }) => {
    if (!comments || comments.length === 0) return null;
    return (
      <div>
        {comments.map((comment) => {
          const hasLiked = comment.likedBy.includes(userId);
          return (
            <div key={comment.id} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <aside style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: comment.user.role === 'teacher' ? '#28a745' : '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                  {comment.user?.name?.charAt(0) || 'U'}
                </aside>
                <div style={{ flexGrow: 1 }}>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{comment.user?.name || 'Unknown User'}</span>
                    <time style={{ fontSize: '0.75rem', color: '#6c757d' }}>{new Date(comment.timestamp).toLocaleString()}</time>
                  </header>
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{comment.content}</p>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '15px' }}>
                    <button onClick={() => handleLikeComment(postId, comment.id)} style={{ padding: '4px 8px', fontSize: '0.8em', border: 'none', background: 'none', color: hasLiked ? '#e0245e' : '#657786', cursor: 'pointer', fontWeight: 'bold' }}>Like {comment.likes > 0 && `(${comment.likes})`}</button>
                    <button onClick={() => setReplyingTo({ postId, commentId: comment.id })} style={{ padding: '4px 8px', fontSize: '0.8em', border: 'none', background: 'none', color: '#657786', cursor: 'pointer' }}>Reply</button>
                  </div>
                  {replyingTo?.commentId === comment.id && <CreateCommentForm placeholder={`Replying to ${comment.user?.name}...`} onSubmitComment={(content) => handleAddComment(postId, comment.id, content)} onCancel={() => setReplyingTo(null)} />}
                </div>
              </div>
              <div style={{ paddingLeft: '44px', marginTop: '8px' }}>
                <CommentList comments={comment.replies} postId={postId} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const PostCard = ({ post }) => {
    const hasLikedPost = post.likedBy.includes(userId);
    return (
      <article style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
        <header style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <strong>{post.user.name}</strong>
          <span style={{ float: 'right', color: '#888', fontSize: '0.8em' }}>{new Date(post.timestamp).toLocaleString()}</span>
        </header>
        <p style={{ margin: '0 0 1rem 0' }}>{post.content}</p>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => handleLikePost(post.id)} style={{ padding: '4px 8px', fontSize: '0.9em', border: 'none', background: 'none', color: hasLikedPost ? '#e0245e' : '#657786', cursor: 'pointer', fontWeight: 'bold' }}>Like {post.likes > 0 && `(${post.likes})`}</button>
        </div>
        <section>
          <h4>Comments</h4>
          <CommentList comments={post.comments} postId={post.id} />
          {!replyingTo && <CreateCommentForm onSubmitComment={(content) => handleAddComment(post.id, null, content)} />}
        </section>
      </article>
    );
  };

  const CreatePostForm = ({ onCreatePost }) => {
    const [content, setContent] = useState('');
    const handleSubmit = (e) => {
      e.preventDefault(); if (!content.trim()) return;
      const newPost = { id: Date.now(), content, user: { name: userName, role: role }, timestamp: new Date(), allowComments: true, comments: [], likes: 0, likedBy: [] };
      onCreatePost(newPost); setContent('');
    };
    return (
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Create a New Post</h3>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" rows="3" style={{ width: '95%', padding: '0.5rem', marginBottom: '0.5rem' }} />
        <br /><button type="submit">Post</button>
      </form>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>{classInfo ? classInfo.name : 'Loading...'}</h1>
        <button onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>View Class Info</button>
      </header>
      {role === 'teacher' && <CreatePostForm onCreatePost={handleCreatePost} />}
      <main>
        <h2>Posts</h2>
        {posts.length === 0 ? (<p>No posts yet. The teacher needs to create one!</p>) : (posts.map(post => <PostCard key={post.id} post={post} />))}
      </main>
      <ViewClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} classInfo={classInfo} />
    </div>
  );
};

export default ClassPage;