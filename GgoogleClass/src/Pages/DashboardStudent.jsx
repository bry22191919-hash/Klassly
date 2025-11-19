import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';

export default function DashboardStudent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate('/login');
      return;
    }
    if (u.role !== 'student') {
      // redirect non-students to their area
      navigate(u.role === 'teacher' ? '/teacher' : '/login');
      return;
    }
    setUser(u);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Student Dashboard</h2>
        <p>Welcome, <strong>{user.name || user.email}</strong></p>
        <p style={{ color: '#666' }}>{user.email}</p>
        <button onClick={handleLogout} style={styles.button}>Log out</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card: { background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.08)', width: 420, textAlign: 'center' },
  button: { marginTop: 16, padding: '0.6rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};
