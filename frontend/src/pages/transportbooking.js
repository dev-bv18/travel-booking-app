import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TransportBooking.css';

const TransportBooking = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('roundtrip');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('ECONOMY');
  const [airportSuggestions, setAirportSuggestions] = useState({ departure: [], destination: [] });
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);

  // Use your existing backend endpoint
  const API_BASE_URL = '/api/amadeus'; // Relative path to your backend route

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    setDepartDate(today.toISOString().split('T')[0]);
    setReturnDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch airport suggestions
  const searchAirports = async (query, type) => {
    if (query.length < 2) {
      setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/airports`, {
        params: { query }
      });
      setAirportSuggestions(prev => ({ ...prev, [type]: response.data }));
    } catch (err) {
      console.error('Airport search error:', err);
      setError('Failed to load airport suggestions');
    }
  };

  // Handle flight search
  const searchFlights = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = {
        origin: departure,
        destination,
        departDate,
        passengers,
        cabinClass,
        tripType
      };

      if (tripType === 'roundtrip') params.returnDate = returnDate;

      const response = await axios.get(`${API_BASE_URL}/flights`, { params });
      setFlights(response.data);
    } catch (err) {
      console.error('Flight search error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  const selectAirport = (airport, type) => {
    if (type === 'departure') setDeparture(airport.code);
    else setDestination(airport.code);
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  return (
    <div className="travel-booking-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="booking-form-container">
        <h1>Flight Search</h1>
        
        <div className="trip-type-selector">
          {['roundtrip', 'oneway'].map(type => (
            <button
              key={type}
              className={tripType === type ? 'active' : ''}
              onClick={() => setTripType(type)}
            >
              {type === 'roundtrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>

        <form onSubmit={searchFlights} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>From</label>
              <input
                type="text"
                placeholder="City or Airport"
                value={departure}
                onChange={(e) => {
                  setDeparture(e.target.value);
                  searchAirports(e.target.value, 'departure');
                }}
                required
              />
              {airportSuggestions.departure.length > 0 && (
                <div className="suggestions-dropdown">
                  {airportSuggestions.departure.map((airport) => (
                    <div
                      key={`dep-${airport.code}`}
                      className="suggestion-item"
                      onClick={() => selectAirport(airport, 'departure')}
                    >
                      <strong>{airport.code}</strong> - {airport.name}, {airport.city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="swap-btn" onClick={swapLocations}>
              ⇄
            </button>

            <div className="form-group">
              <label>To</label>
              <input
                type="text"
                placeholder="City or Airport"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  searchAirports(e.target.value, 'destination');
                }}
                required
              />
              {airportSuggestions.destination.length > 0 && (
                <div className="suggestions-dropdown">
                  {airportSuggestions.destination.map((airport) => (
                    <div
                      key={`dest-${airport.code}`}
                      className="suggestion-item"
                      onClick={() => selectAirport(airport, 'destination')}
                    >
                      <strong>{airport.code}</strong> - {airport.name}, {airport.city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Departure</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {tripType === 'roundtrip' && (
              <div className="form-group">
                <label>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  min={departDate}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Passengers</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cabin Class</label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Searching...
              </>
            ) : (
              'Search Flights'
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              ×
            </button>
          </div>
        )}
      </div>

      {flights.length > 0 && (
        <div className="flight-results">
          <h2>Available Flights</h2>
          <div className="flights-container">
            {flights.map((flight) => (
              <div key={`${flight.airline}-${flight.flightNumber}`} className="flight-card">
                <div className="flight-header">
                  <h3>
                    {flight.origin} → {flight.destination}
                    <span className="flight-number">{flight.airline} {flight.flightNumber}</span>
                  </h3>
                  <div className="flight-price">${flight.price}</div>
                </div>
                <div className="flight-details">
                  <div>
                    <strong>Depart:</strong> {new Date(flight.departureTime).toLocaleString()}
                  </div>
                  <div>
                    <strong>Arrive:</strong> {new Date(flight.arrivalTime).toLocaleString()}
                  </div>
                  <div>
                    <strong>Duration:</strong> {flight.duration}
                  </div>
                  <button 
                    className="select-flight-btn"
                    onClick={() => alert(`Selected flight ${flight.airline} ${flight.flightNumber}`)}
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportBooking;