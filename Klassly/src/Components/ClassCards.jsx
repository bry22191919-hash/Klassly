import React from 'react';
import { Link } from 'react-router-dom';

const ClassCard = ({ classData }) => {
  return (
    <Link to={`/class/${classData.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        className="class-card" 
        style={{ 
          border: '1px solid #ccc', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Display the Class Name and Subject as the main title */}
        <h3>{classData.name}</h3>
        <p style={{ color: '#555', fontStyle: 'italic' }}>{classData.subject}</p>
        
        {/* Display Section and Teacher Name as sub-details */}
        <div style={{ marginTop: '10px' }}>
            <p><strong>Section:</strong> {classData.section}</p>
            <p><strong>Teacher:</strong> {classData.teacherName}</p>
        </div>
      </div>
    </Link>
  );
};

export default ClassCard;