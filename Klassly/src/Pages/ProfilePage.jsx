import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "../Components/PostCard";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    profilePicture: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Add comprehensive debugging
  useEffect(() => {
    console.log('=== ProfilePage Mounted ===');
    console.log('URL params id:', id);
    console.log('Type of id:', typeof id);
    console.log('id value:', id);
  }, [id]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      // Try both possible storage keys
      const storedId = localStorage.getItem("userId") || localStorage.getItem("id");
      const userId = storedId ? Number(storedId) : null;
      
      console.log('Auth check - storedId:', storedId, 'userId:', userId);
      
      // Only redirect if NO user ID is found
      if (!userId) {
        console.log('No user ID found, redirecting to login');
        navigate("/login");
        return;
      }
      
      // If we have a user ID, don't redirect - let the page load
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('=== Starting User Data Fetch ===');
      console.log('Fetch URL for user:', `http://localhost:3001/api/users/${id}`);
      console.log('Fetch URL for posts:', `http://localhost:3001/api/users/${id}/posts`);
      
      // Check if ID is valid
      if (!id || isNaN(id)) {
        console.error('Invalid user ID:', id);
        setApiError("Invalid user ID");
        setIsLoading(false);
        return;
      }

      try {
        console.log('Making API requests...');
        
        const [userRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/users/${id}`),
          axios.get(`http://localhost:3001/api/users/${id}/posts`)
        ]);
        
        console.log('User data received:', userRes.data);
        console.log('Posts data received:', postsRes.data);
        
        setUser(userRes.data);
        setPosts(postsRes.data);
        setEditForm({
          name: userRes.data.name,
          email: userRes.data.email,
          bio: userRes.data.bio || "",
          profilePicture: userRes.data.profilePicture || ""
        });
        
      } catch (err) {
        console.error('API Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setApiError("Failed to load profile data");
      } finally {
        console.log('Fetch completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleEditToggle = () => {
    console.log('Toggle edit mode:', !isEditing);
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    console.log('Edit form change:', e.target.name, 'to', e.target.value);
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Add file size check (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    console.log('Profile picture file selected:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditForm({...editForm, profilePicture: e.target.result});
    };
    reader.readAsDataURL(file);
  }
};

const handleSaveProfile = async () => {
  console.log('Saving profile:', editForm);
  try {
    console.log('Making save request to:', `http://localhost:3001/api/users/${id}`);
    
    // Create form data for proper file upload
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('email', editForm.email);
    formData.append('bio', editForm.bio);
    
    // Handle profile picture separately if it exists
    if (editForm.profilePicture && editForm.profilePicture.startsWith('data:image')) {
      // Convert base64 to blob for file upload
      const response = await fetch(editForm.profilePicture);
      const blob = await response.blob();
      formData.append('profilePicture', blob, 'profile.jpg');
    }
    
    const response = await axios.put(
      `http://localhost:3001/api/users/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Save response:', response.data);
    setUser({ ...user, ...editForm });
    setIsEditing(false);
    
  } catch (err) {
    console.error('Save error:', err);
    // Check if it's a payload too large error
    if (err.response?.status === 413) {
      setApiError("Profile picture is too large. Please use a smaller image (max 5MB).");
    } else {
      setApiError("Failed to save profile changes");
    }
  }
};

  const handleCancelEdit = () => {
    console.log('Canceling edit');
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profilePicture: user?.profilePicture || ""
    });
    setIsEditing(false);
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#718096" }}>Loading profile...</div>
        <div style={{ fontSize: "14px", color: "#718096", marginTop: "8px" }}>
          Check console for debugging information
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#ef4444" }}>{apiError}</div>
        <div style={{ fontSize: "14px", color: "#718096", marginTop: "8px" }}>
          Please check your connection or contact support
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#ef4444" }}>User not found</div>
        <div style={{ fontSize: "14px", color: "#718096", marginTop: "8px" }}>
          The requested user profile could not be loaded
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Profile Header with purple background - matches the design */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Profile picture with camera icon */}
        <div style={{
          position: "relative",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: "bold",
          color: "white",
          background: "rgba(255, 255, 255, 0.2)",
          marginBottom: "16px"
        }}>
          {editForm.profilePicture ? (
            <img 
              src={editForm.profilePicture} 
              alt="Profile" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <img 
              src="https://picsum.photos/id/64/80/80" 
              alt="Profile" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {/* Camera icon overlay */}
          <div style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "24px",
            height: "24px",
            background: "#4f46e5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white"
          }}>
            <span style={{ fontSize: "12px", color: "white" }}>📷</span>
          </div>
        </div>
        
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {user.name}
          </h1>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
            {user.email}
          </p>
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            marginTop: "8px",
            fontSize: "12px",
            fontWeight: "500"
          }}>
            {user.role}
          </div>
        </div>
      </div>

      {/* User Statistics - matches the design */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          flex: 1,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748" }}>
            4
          </div>
          <div style={{ fontSize: "14px", color: "#718096" }}>Classes</div>
        </div>
        
        <div style={{
          flex: 1,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748" }}>
            12
          </div>
          <div style={{ fontSize: "14px", color: "#718096" }}>Assignments</div>
        </div>
        
        <div style={{
          flex: 1,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748" }}>
            8
          </div>
          <div style={{ fontSize: "14px", color: "#718096" }}>Submissions</div>
        </div>
      </div>

      {/* Profile Information - matches the design */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#4a5568"
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Full Name</div>
            <div style={{ fontSize: "16px", color: "#2d3748" }}>{user.name}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#4a5568"
          }}>
            📧
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Email Address</div>
            <div style={{ fontSize: "16px", color: "#2d3748" }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#4a5568"
          }}>
            📚
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Role</div>
            <div style={{ fontSize: "16px", color: "#2d3748" }}>{user.role}</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button - matches the design */}
      <button
        onClick={handleEditToggle}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        Edit Profile
      </button>

      {/* Edit Profile Form */}
      {isEditing && (
        <div style={{ marginTop: "24px", padding: "24px", background: "#f8f9fa", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "18px", color: "#2d3748", marginBottom: "16px" }}>Edit Profile</h3>
          
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #e2e8f0"
            }}>
              {editForm.profilePicture ? (
                <img 
                  src={editForm.profilePicture} 
                  alt="Profile" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e2e8f0",
                  fontSize: "32px",
                  color: "#4a5568"
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
                id="profilePictureInput"
              />
              <label 
                htmlFor="profilePictureInput"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginBottom: "12px"
                }}
              >
                Change Photo
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#718096", marginBottom: "4px" }}>Bio (optional)</label>
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleEditChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleSaveProfile}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                padding: "10px 20px",
                background: "#f7fafc",
                color: "#4a5564",
                border: "1px solid #cbd5e0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User Posts Section */}
      <div style={{ marginTop: "32px" }}>
        <h2 style={{ fontSize: "20px", color: "#2d3748", marginBottom: "16px" }}>Your Posts</h2>
        {posts.length > 0 ? (
          <div style={{ display: "grid", gap: "16px" }}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
            No posts yet. Create your first post!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;