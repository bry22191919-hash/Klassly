import React, { useState, useEffect } from "react";
import axios from "axios";

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("id");

  // Theme state - starts with light theme
  const [theme, setTheme] = useState("light");

  // Apply theme to body when it changes
  useEffect(() => {
    document.body.className = theme;
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  // Notification settings state
  const [notifications, setNotifications] = useState({
    assignment: true,
    comment: true,
    announcements: true,
    grade: false
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    passwordChange: false,
    twoFactorAuth: false
  });

  // Language settings state
  const [language, setLanguage] = useState("English (US)");

  // Add comprehensive debugging
  useEffect(() => {
    console.log('=== SettingsPage Mounted ===');
    console.log('UserId from localStorage:', userId);
    console.log('Type of userId:', typeof userId);
    console.log('userId value:', userId);
    console.log('userId length:', userId ? userId.length : 'null');
    
    // Check if userId is in the correct format
    if (userId && userId.includes(':')) {
      console.warn('UserId contains colon:', userId, 'This might cause issues with API routes');
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('=== Starting User Data Fetch ===');
      console.log('Fetch URL:', `http://localhost:3001/api/users/${userId}`);
      
      if (!userId) {
        console.error('No userId found in localStorage');
        setError("User ID not found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log('Making API request with axios...');
        
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Log the structure of the received data
        if (response.data) {
          console.log('User data keys:', Object.keys(response.data));
        }
        
      } catch (err) {
        console.error('Axios error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        setError("Failed to load user data");
      } finally {
        console.log('Fetch completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleNotificationChange = (setting) => {
    console.log('=== Toggle Notification ===');
    console.log('Setting:', setting);
    console.log('Current value:', notifications[setting]);
    console.log('New value:', !notifications[setting]);
    
    setNotifications(prev => {
      const newState = {
        ...prev,
        [setting]: !prev[setting]
      };
      console.log('New notifications state:', newState);
      return newState;
    });
  };

  const handlePrivacyChange = (setting) => {
    console.log('=== Toggle Privacy ===');
    console.log('Setting:', setting);
    console.log('Current value:', privacy[setting]);
    console.log('New value:', !privacy[setting]);
    
    setPrivacy(prev => {
      const newState = {
        ...prev,
        [setting]: !prev[setting]
      };
      console.log('New privacy state:', newState);
      return newState;
    });
  };

  const handleLanguageChange = (e) => {
    console.log('=== Change Language ===');
    console.log('New language:', e.target.value);
    setLanguage(e.target.value);
  };

  const handleSaveSettings = async () => {
    console.log('=== Save Settings ===');
    console.log('Saving notifications:', notifications);
    console.log('Saving privacy:', privacy);
    console.log('Saving theme:', theme);
    console.log('Saving language:', language);
    
    try {
      console.log('Making save request with axios...');
      
      const response = await axios.put(
        `http://localhost:3001/api/users/${userId}/settings`,
        { notifications, privacy, theme, language }
      );
      
      console.log('Save response status:', response.status);
      console.log('Save response data:', response.data);
      
      alert("Settings saved successfully!");
      
    } catch (err) {
      console.error('Save error:', err);
      setError("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#718096" }}>Loading settings...</div>
        <div style={{ fontSize: "14px", color: "#718096", marginTop: "8px" }}>
          Check console for debugging information
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
        <div style={{ fontSize: "18px" }}>{error}</div>
        <div style={{ fontSize: "14px", marginTop: "8px", color: "#718096" }}>
          Check browser console for detailed error information
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", color: "#2d3748", marginBottom: "24px" }}>Settings</h1>
      
      {/* Notifications Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ color: "#6366f1", fontSize: "20px" }}>🔔</div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748" }}>Notifications</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Assignment Notifications */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Assignment notifications</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Get notified about new assignments</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={notifications.assignment}
                onChange={() => handleNotificationChange("assignment")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications.assignment ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: notifications.assignment ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
          
          {/* Comment Notifications */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Comment notifications</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Get notified about new comments</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={notifications.comment}
                onChange={() => handleNotificationChange("comment")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications.comment ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: notifications.comment ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
          
          {/* Announcements */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Announcements</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Get notified about class announcements</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={notifications.announcements}
                onChange={() => handleNotificationChange("announcements")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications.announcements ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: notifications.announcements ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
          
          {/* Grade Notifications */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Grade notifications</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Get notified when grades are posted</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={notifications.grade}
                onChange={() => handleNotificationChange("grade")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications.grade ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: notifications.grade ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ color: "#6366f1", fontSize: "20px" }}>🎨</div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748" }}>Appearance</h2>
        </div>
        
        <div>
          <p style={{ margin: 0, fontSize: "14px", color: "#2d3748", marginBottom: "12px" }}>Theme</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleThemeChange("light")}
              style={{
                flex: 1,
                padding: "12px",
                background: theme === "light" ? "#e0e7ff" : "#ffffff",
                border: theme === "light" ? "2px solid #6366f1" : "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                color: theme === "light" ? "#4f46e5" : "#2d3748"
              }}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              style={{
                flex: 1,
                padding: "12px",
                background: theme === "dark" ? "#1f2937" : "#ffffff",
                border: theme === "dark" ? "2px solid #6366f1" : "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                color: theme === "dark" ? "#ffffff" : "#2d3748"
              }}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange("auto")}
              style={{
                flex: 1,
                padding: "12px",
                background: theme === "auto" ? "#e0e7ff" : "#ffffff",
                border: theme === "auto" ? "2px solid #6366f1" : "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                color: theme === "auto" ? "#4f46e5" : "#2d3748"
              }}
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ color: "#6366f1", fontSize: "20px" }}>🌐</div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748" }}>Language & Region</h2>
        </div>
        
        <div>
          <p style={{ margin: 0, fontSize: "14px", color: "#2d3748", marginBottom: "12px" }}>Language</p>
          <select
            value={language}
            onChange={handleLanguageChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#2d3748"
            }}
          >
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ color: "#6366f1", fontSize: "20px" }}>🔒</div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#2d3748" }}>Privacy & Security</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Change Password */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Change Password</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Update your password regularly for security</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={privacy.passwordChange}
                onChange={() => handlePrivacyChange("passwordChange")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: privacy.passwordChange ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: privacy.passwordChange ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
          
          {/* Two-Factor Authentication */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: "#2d3748" }}>Two-Factor Authentication</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>Add an extra layer of security</p>
            </div>
            <label 
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "28px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={privacy.twoFactorAuth}
                onChange={() => handlePrivacyChange("twoFactorAuth")}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: privacy.twoFactorAuth ? "#6366f1" : "#e5e7eb",
                  borderRadius: "14px",
                  transition: "0.4s"
                }}
              >
                <span 
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: privacy.twoFactorAuth ? "20px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s"
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleSaveSettings}
          style={{
            padding: "10px 24px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#4f46e5"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#6366f1"}
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;