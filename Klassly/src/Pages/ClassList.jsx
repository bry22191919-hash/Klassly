import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClassList = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/classes')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]));
  }, []);

  return (
    <div>
      <h2>All Classes</h2>
      {classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        <ul>
          {classes.map(cls => (
            <li key={cls.id}>
              <strong>{cls.name}</strong> — {cls.description}
              {/* Add a link to view the class page */}
              <a href={`/#/class/${cls.id}`}>View</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassList;