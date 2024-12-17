import React from 'react';

const EditPackageList = ({ onClose }) => {
  return (
    <div>
      <h2>Edit Packages</h2>
      <p>Here, admins can view and edit packages (to be implemented).</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default EditPackageList;
