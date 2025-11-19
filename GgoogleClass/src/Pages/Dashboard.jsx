import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';
import ViewClassModal from '../Components/ViewClassModal';

// Modal for creating a new class (for Teachers)
const CreateClassModal = ({ isOpen, onClose, onCreateClass }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    section: '',
    room: '',
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    onCreateClass({
      id: `class_${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      section: formData.section,
      room: formData.room,
      students: 0,
      classCode: `C${Math.random().toString(36).substr(2, 7).toUpperCase()}`
    });
    
    // Reset form
    setFormData({
      name: '',
      subject: '',
      section: '',
      room: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Create New Class</h3>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>Class Name *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle(errors.name)}
              placeholder="e.g., Algebra 101"
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>
          
          <div style={formGroupStyle}>
            <label>Subject *</label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              style={inputStyle(errors.subject)}
              placeholder="e.g., Mathematics"
            />
            {errors.subject && <div style={errorStyle}>{errors.subject}</div>}
          </div>
          
          <div style={formGroupStyle}>
            <label>Section (Optional)</label>
            <input 
              type="text" 
              name="section"
              value={formData.section}
              onChange={handleChange}
              style={inputStyle()}
              placeholder="e.g., A, B, C"
            />
          </div>
          
          <div style={formGroupStyle}>
            <label>Room (Optional)</label>
            <input 
              type="text" 
              name="room"
              value={formData.room}
              onChange={handleChange}
              style={inputStyle()}
              placeholder="e.g., Room 205"
            />
          </div>
          
          <div style={buttonGroupStyle}>
            <button 
              type="button" 
              onClick={onClose}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={createButtonStyle}
            >
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for joining a class (for Students)
const JoinClassModal = ({ isOpen, onClose, onJoinClass }) => {
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    setIsLoading(true);
    // call parent handler which will validate against existing classes
    const res = await onJoinClass(classCode.trim());
    setIsLoading(false);

    if (!res.ok) {
      setError(res.message || 'Unable to join class');
      return;
    }

    // success
    setClassCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Join a Class</h3>
        <p>Ask your teacher for the class code, then enter it here.</p>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>Class Code</label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              style={inputStyle(error)}
              placeholder="Enter class code"
              autoFocus
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>

          <div style={buttonGroupStyle}>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyle}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={joinButtonStyle}
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const sampleClasses = [
    {
      id: 'class_1',
      name: 'Mathematics 101',
      subject: 'Mathematics',
      section: 'A',
      room: 'Room 101',
      students: 24,
      classCode: 'ABC123'
    },
    {
      id: 'class_2',
      name: 'Physics 201',
      subject: 'Physics',
      section: 'B',
      room: 'Lab 205',
      students: 18,
      classCode: 'XYZ789'
    },
  ];

  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState(() => {
    try {
      const raw = localStorage.getItem('classes');
      return raw ? JSON.parse(raw) : sampleClasses;
    } catch {
      return sampleClasses;
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userRole, setUserRole] = useState('student');
  // add new local state for viewing class posts
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const navigate = useNavigate();

  // Persist classes whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('classes', JSON.stringify(classes));
    } catch {
      // ignore
    }
  }, [classes]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(u);
    setUserRole(u.role || 'student');
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateClass = (newClass) => {
    // ensure classCode uniqueness
    let classCode = newClass.classCode || (`C${Math.random().toString(36).substr(2, 7).toUpperCase()}`);
    while (classes.some(c => c.classCode === classCode)) {
      classCode = `C${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    }

    const toSave = { ...newClass, classCode, students: newClass.students || 0 };
    setClasses(prev => [toSave, ...prev]);
    // modal will be closed by caller
  };

  const handleJoinClass = async (classCode) => {
    if (!user) return { ok: false, message: 'You must be logged in to join classes' };

    // find class by code (case-insensitive)
    const idx = classes.findIndex(c => c.classCode.toLowerCase() === classCode.toLowerCase());
    if (idx === -1) {
      return { ok: false, message: 'Class code not found. Ask your teacher for the correct code.' };
    }

    // prevent double-join per user
    const joinedKey = `joined_${user.id}`;
    let joined = [];
    try {
      const raw = localStorage.getItem(joinedKey);
      joined = raw ? JSON.parse(raw) : [];
    } catch { joined = []; }

    if (joined.includes(classCode.toUpperCase())) {
      return { ok: false, message: 'You already joined this class' };
    }

    // mark joined and increment student count
    joined.push(classCode.toUpperCase());
    try {
      localStorage.setItem(joinedKey, JSON.stringify(joined));
    } catch { /* ignore */ }

    setClasses(prev => {
      const next = [...prev];
      const found = next.find(c => c.classCode.toLowerCase() === classCode.toLowerCase());
      if (found) {
        found.students = (found.students || 0) + 1;
      }
      return next;
    });

    return { ok: true, message: 'Successfully joined the class' };
  };

  const copyClassCode = (code) => {
    if (!navigator.clipboard) {
      alert('Clipboard not supported');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      alert('Class code copied to clipboard!');
    }, () => {
      alert('Failed to copy class code');
    });
  };

  // Helper: load posts for a class from localStorage
  const loadPostsForClass = (classId) => {
    try {
      const raw = localStorage.getItem(`posts_${classId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper: create post for a class and persist
  const createPostForClass = (classId, { content, authorId, authorName, role }) => {
    const post = {
      id: `post_${Date.now()}`,
      content,
      authorId,
      authorName,
      role: role || 'teacher',
      createdAt: new Date().toISOString(),
      comments: []
    };
    const key = `posts_${classId}`;
    const current = loadPostsForClass(classId);
    const next = [post, ...current];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
    return post;
  };

  // Helper: add comment to a post for a class
  const addCommentToPost = (classId, postId, { authorId, authorName, content }) => {
    const key = `posts_${classId}`;
    const posts = loadPostsForClass(classId);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return null;
    const comment = {
      id: `c_${Date.now()}`,
      authorId,
      authorName,
      content,
      createdAt: new Date().toISOString()
    };
    posts[idx].comments = posts[idx].comments || [];
    posts[idx].comments.push(comment);
    try { localStorage.setItem(key, JSON.stringify(posts)); } catch {}
    return comment;
  };

  // Open class modal instead of navigating
  const openClassModal = (classItem) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  if (!user) return null;

  return (
    <div style={dashboardContainerStyle}>
      <div style={headerStyle}>
        <div>
          <h1>My Classes</h1>
          <div style={{ color: '#5f6368' }}>{user.name ? `Signed in as ${user.name}` : user.email}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={buttonGroupStyle}>
            <button
              onClick={() => setShowJoinModal(true)}
              style={secondaryButtonStyle}
            >
              Join Class
            </button>
            {userRole === 'teacher' && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={primaryButtonStyle}
              >
                Create Class
              </button>
            )}
          </div>

          <button onClick={handleLogout} style={{ ...secondaryButtonStyle, padding: '8px 12px' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Create Class Modal */}
      {userRole === 'teacher' && (
        <CreateClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateClass={handleCreateClass}
        />
      )}

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinClass={handleJoinClass}
      />

      {/* Classes Grid */}
      <div style={classesGridStyle}>
        {classes.map((classItem) => (
          <div key={classItem.id} style={classCardStyle}>
            <div style={classCardHeaderStyle}>
              <h3 style={{ margin: 0 }}>{classItem.name}</h3>
              {classItem.section && <span style={sectionTagStyle}>{classItem.section}</span>}
            </div>

            <div style={classInfoStyle}>
              <p style={infoTextStyle}><strong>Subject:</strong> {classItem.subject}</p>
              {classItem.room && <p style={infoTextStyle}><strong>Room:</strong> {classItem.room}</p>}
              <p style={infoTextStyle}><strong>Students:</strong> {classItem.students}</p>

              {userRole === 'teacher' && (
                <div style={classCodeContainerStyle}>
                  <span style={classCodeLabelStyle}>Class Code: </span>
                  <div style={classCodeStyle}>
                    {classItem.classCode}
                    <button
                      onClick={() => copyClassCode(classItem.classCode)}
                      style={copyButtonStyle}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={classActionsStyle}>
              {/* changed: open modal instead of Link */}
              <button
                onClick={() => openClassModal(classItem)}
                style={viewClassButtonStyle}
              >
                View Class
              </button>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div style={emptyStateStyle}>
            <p>No classes yet. {userRole === 'teacher' ? 'Create' : 'Join'} a class to get started.</p>
            {userRole === 'teacher' ? (
              <button
                onClick={() => setShowCreateModal(true)}
                style={primaryButtonStyle}
              >
                Create Your First Class
              </button>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                style={primaryButtonStyle}
              >
                Join a Class
              </button>
            )}
          </div>
        )}
      </div>

      {/* Class Detail / Announcements Modal */}
      <ViewClassModal
        isOpen={showClassModal}
        onClose={() => { setShowClassModal(false); setSelectedClass(null); }}
        classItem={selectedClass}
        user={user}
        isTeacher={userRole === 'teacher'}
        loadPostsForClass={loadPostsForClass}
        createPostForClass={createPostForClass}
        addCommentToPost={addCommentToPost}
      />
    </div>
  );
}

// Styles
const dashboardContainerStyle = {
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const primaryButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#1a73e8',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#f1f3f4',
  color: '#3c4043',
  border: '1px solid #dadce0',
};

const classesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  marginTop: '16px'
};

const classCardStyle = {
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const classCardHeaderStyle = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const sectionTagStyle = {
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500'
};

const classInfoStyle = {
  padding: '16px',
  flexGrow: 1
};

const infoTextStyle = {
  margin: '8px 0',
  color: '#5f6368',
  fontSize: '14px'
};

const classCodeContainerStyle = {
  marginTop: '16px',
  paddingTop: '12px',
  borderTop: '1px dashed #e0e0e0'
};

const classCodeLabelStyle = {
  fontSize: '12px',
  color: '#5f6368',
  display: 'block',
  marginBottom: '4px'
};

const classCodeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#f1f3f4',
  padding: '6px 12px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px'
};

const copyButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  opacity: '0.7',
};

const classActionsStyle = {
  padding: '12px 16px',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'flex-end'
};

const viewClassButtonStyle = {
  color: '#1a73e8',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
};

const emptyStateStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '48px 20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px'
};

// Modal Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '448px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const formGroupStyle = {
  marginBottom: '16px'
};

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${hasError ? '#d93025' : '#dadce0'}`,
  borderRadius: '4px',
  fontSize: '14px',
  marginTop: '4px'
});

const errorStyle = {
  color: '#d93025',
  fontSize: '12px',
  marginTop: '4px'
};

const cancelButtonStyle = {
  ...secondaryButtonStyle,
  border: '1px solid #dadce0'
};

const createButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#1a73e8',
};

const joinButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#34a853',
};
