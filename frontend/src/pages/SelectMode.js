import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectMode = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleModeSelect = (mode) => {
    navigate(`/book/${mode}`, { state: { origin, destination } });
  };

  return (
    <div className="mode-selector">
      <h2>Where are you traveling?</h2>
      <input
        placeholder="From (e.g., NYC)"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      />
      <input
        placeholder="To (e.g., LAX)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <div className="mode-buttons">
        <button onClick={() => handleModeSelect('flight')}>✈️ Flight</button>
        <button onClick={() => handleModeSelect('train')}>🚆 Train</button>
        <button onClick={() => handleModeSelect('bus')}>🚌 Bus</button>
      </div>
    </div>
  );
};
export default SelectMode;