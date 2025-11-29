import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Inline assignment form for modal
const InlineAssignmentForm = ({ classId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (!description.trim()) return 'Description is required.';
    if (!dueDate) return 'Due date is required.';
    if (!points || isNaN(points)) return 'Points must be a number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('dueDate', dueDate);
      formData.append('points', points);
      formData.append('classId', classId);
      if (file) formData.append('file', file);
      const res = await axios.post('http://localhost:3001/api/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Assignment created successfully.' + (res.data?.id ? ` ID: ${res.data.id}` : ''));
      setTitle('');
      setDescription('');
      setDueDate('');
      setPoints('');
      setFile(null);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment. Check the console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#fff', border: '2px solid #007bff', padding: '1.5rem', borderRadius: '10px', position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, minWidth: '350px' }}>
      <h2>Create Assignment</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        <label>Points</label>
        <input type="number" value={points} onChange={e => setPoints(e.target.value)} required />
        <label>Attach File (optional)</label>
        <input type="file" onChange={handleFileChange} />
        {file && <p>Selected file: {file.name}</p>}
        <div style={{ marginTop: '1rem' }}>
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Assignment'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '1rem' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const ClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  // --- STATE MANAGEMENT ---
  const [posts, setPosts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showSubmission, setShowSubmission] = useState(null); // assignmentId or null
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

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

  // --- Fetch class info and assignments ---
  useEffect(() => {
    const allClasses = JSON.parse(localStorage.getItem('classes')) || [];
    const currentClass = allClasses.find(c => c.id === Number(classId));
    if (currentClass) {
      setClassInfo(currentClass);
    } else {
      // Try to fetch class info from backend
      axios.get('http://localhost:3001/api/classes')
        .then(res => {
          const found = (res.data || []).find(c => String(c.id) === String(classId));
          if (found) setClassInfo(found);
          else setClassInfo({ name: `Class ID: ${classId}`, section: 'N/A', subject: 'N/A', teacherName: 'N/A' });
        })
        .catch(() => setClassInfo({ name: `Class ID: ${classId}`, section: 'N/A', subject: 'N/A', teacherName: 'N/A' }));
    }
    setPosts([]);

    // Fetch assignments for this class
    axios.get(`http://localhost:3001/api/assignments`)
      .then(res => {
        // Filter assignments for this class
        const filtered = res.data.filter(a => String(a.classId) === String(classId));
        setAssignments(filtered);
      })
      .catch(err => {
        setAssignments([]);
      });
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

  // --- Assignment Submission Form ---
  const AssignmentSubmissionForm = ({ assignment, onClose }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e) => {
      setFile(e.target.files[0] || null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('assignmentId', assignment.id);
        formData.append('studentId', userId);
        formData.append('text', text);
        if (file) formData.append('file', file);
        await axios.post('http://localhost:3001/api/submissions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Submission successful!');
        setText('');
        setFile(null);
        onClose();
      } catch (err) {
        alert('Submission failed.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
        <h3>Submit Assignment: {assignment.title}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Text Response (optional)</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} style={{ width: '100%', marginBottom: '1rem' }} />
          <label>File Upload (optional)</label>
          <input type="file" onChange={handleFileChange} />
          {file && <p>Selected file: {file.name}</p>}
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            <button type="button" onClick={onClose} style={{ marginLeft: '1rem' }}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>{classInfo ? classInfo.name : 'Loading...'}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>View Class Info</button>
          {role === 'teacher' && (
            <button onClick={() => setShowAssignmentForm(true)} style={{ cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem' }}>Create Assignment</button>
          )}
        </div>
      </header>
      {/* Assignment creation modal */}
      {showAssignmentForm && (
        <InlineAssignmentForm classId={classId} onClose={() => setShowAssignmentForm(false)} onCreated={() => {
          // Refresh assignments after creation
          axios.get(`http://localhost:3001/api/assignments`).then(res => {
            const filtered = res.data.filter(a => String(a.classId) === String(classId));
            setAssignments(filtered);
          });
        }} />
      )}
      {/* Teacher post form */}
      {role === 'teacher' && <CreatePostForm onCreatePost={handleCreatePost} />}
      {/* Assignments section */}
      <section>
        <h2>Assignments</h2>
        {assignments.length === 0 ? (
          <p>No assignments for this class.</p>
        ) : (
          assignments.map(a => (
            <div key={a.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <p><strong>Due:</strong> {a.dueDate}</p>
              <p><strong>Points:</strong> {a.points}</p>
              {a.filePath && <a href={`http://localhost:3001/${a.filePath.replace('\\','/')}`} target="_blank" rel="noopener noreferrer">Download Attachment</a>}
              {role === 'student' && (
                <button onClick={() => setShowSubmission(a.id)} style={{ marginTop: '1rem' }}>Submit Assignment</button>
              )}
              {showSubmission === a.id && (
                <AssignmentSubmissionForm assignment={a} onClose={() => setShowSubmission(null)} />
              )}
            </div>
          ))
        )}
      </section>
      {/* Posts section */}
      <main>
        <h2>Posts</h2>
        {posts.length === 0 ? (<p>No posts yet. The teacher needs to create one!</p>) : (posts.map(post => <PostCard key={post.id} post={post} />))}
      </main>
      <ViewClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} classInfo={classInfo} />
    </div>
  );
};

export default ClassPage;