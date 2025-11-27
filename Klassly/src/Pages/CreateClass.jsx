import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateClass = () => {
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [teacherName, setTeacherName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get existing classes from localStorage or start with an empty array
    const existingClasses = JSON.parse(localStorage.getItem('classes')) || [];

    // Create the new class object
    const newClass = {
      id: Date.now(), // Simple unique ID
      name: className,
      subject: subject,
      section: section,
      teacherName: teacherName,
    };

    // Save the updated list of classes back to localStorage
    localStorage.setItem('classes', JSON.stringify([...existingClasses, newClass]));

    // Redirect to the dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Create a New Class</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Section</label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Teacher Name</label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" className="user-btn">Create Class</button>
      </form>
    </div>
  );
};

export default CreateClass;