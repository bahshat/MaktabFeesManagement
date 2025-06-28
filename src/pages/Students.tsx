// Create a list of students with their names and IDs
import React from 'react';
import { useState } from 'react';

const  Students: React.FC = () => {
  const [students] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
    { id: 4, name: 'Bob Brown' },
  ]);

  return (
    <div className="students">
      <h2>Students List</h2>
    </div>
  );
};

export default Students
