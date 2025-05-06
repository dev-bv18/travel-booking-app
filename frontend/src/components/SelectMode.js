import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SelectMode = ({ packageData }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [availableModes, setAvailableModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract destination from packageData (passed via props/state)
  const destination = packageData?.destination || '';

  useEffect(() => {
    if (location && destination) {
      checkTransportAvailability();
    }
  }, [location, destination]);

  const checkTransportAvailability = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/transport/availability`,
        {
          params: { origin: location, destination }
        }
      );
      setAvailableModes(response.data.availableModes);
    } catch (err) {
      setError('Failed to check transport options');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    navigate(`/book/${mode}`, { 
      state: { 
        prefilledData: { origin: location, destination } 
      }
    });
  };

  return (
    <div className="mode-selection-container">
      <h2>How would you like to travel to {destination}?</h2>
      
      <div className="input-section">
        <label>
          Your Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or Airport Code"
          />
        </label>
      </div>

      {loading ? (
        <div className="loading">Checking available options...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : availableModes.length > 0 ? (
        <div className="mode-buttons">
          {availableModes.includes('flight') && (
            <button onClick={() => handleModeSelect('flight')}>
              ✈️ Airplane
            </button>
          )}
          {availableModes.includes('train') && (
            <button onClick={() => handleModeSelect('train')}>
              🚆 Train
            </button>
          )}
          {availableModes.includes('bus') && (
            <button onClick={() => handleModeSelect('bus')}>
              🚌 Bus
            </button>
          )}
        </div>
      ) : (
        location && destination && (
          <div className="no-options">
            Currently no available transport modes from {location} to {destination}
          </div>
        )
      )}
    </div>
  );
};

export default SelectMode;



/*
.mode-selection-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.input-section {
  margin: 2rem 0;
}

.input-section input {
  padding: 0.5rem;
  margin-left: 0.5rem;
  width: 200px;
}

.mode-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.mode-buttons button {
  padding: 1rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.no-options {
  color: #d32f2f;
  margin-top: 2rem;
}
*/