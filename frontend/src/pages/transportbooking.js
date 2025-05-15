import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const Booking = () => {
  const { mode } = useParams();
  const { state } = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`/api/transport/${mode}s`, {
          params: {
            origin: state?.origin,
            destination: state?.destination,
            date: new Date().toISOString().split('T')[0]
          }
        });
        setResults(res.data);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [mode, state]);

  return (
    <div className="booking-container">
      <h2>Available {mode === 'flight' ? 'Flights' : mode === 'train' ? 'Trains' : 'Buses'}</h2>
      {loading ? (
        <p>Loading options...</p>
      ) : results.length > 0 ? (
        <ul>
          {results.map((item) => (
            <li key={item.id}>
              <h3>{item.name || `${mode.toUpperCase()} ${item.id}`}</h3>
              <p>⏰ {item.departure}</p>
              <p>💰 ${item.price}</p>
              <a href={item.bookingLink} target="_blank" rel="noopener noreferrer">
                Book Now
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No {mode} options found. Try different locations.</p>
      )}
    </div>
  );
};
export default transportbooking;