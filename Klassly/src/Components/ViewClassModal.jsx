import React from 'react';

const ViewClassModal = ({ isOpen, onClose, classInfo }) => {
  // If the modal is not open or there's no class information, don't render anything
  if (!isOpen || !classInfo) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        minWidth: '300px',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            border: 'none',
            background: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          &times;
        </button>

        <h2>Class Information</h2>
        
        {/* Displaying the real class data passed from ClassPage */}
        <p><strong>Class Name:</strong> {classInfo.name}</p>
        <p><strong>Subject:</strong> {classInfo.subject}</p>
        <p><strong>Section:</strong> {classInfo.section}</p>
        <p><strong>Teacher Name:</strong> {classInfo.teacherName}</p>
      </div>
    </div>
  );
};

export default ViewClassModal;