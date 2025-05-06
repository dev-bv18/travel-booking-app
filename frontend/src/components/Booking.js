import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  // State for search inputs
  const [mode, setMode] = useState('flight');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  
  // State for API data and UI
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filters (with localStorage persistence)
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('travelFilters');
    return savedFilters 
      ? JSON.parse(savedFilters) 
      : { price: 'asc', rating: 'desc' };
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('travelFilters', JSON.stringify(filters));
  }, [filters]);

  // Debounced search function
  const handleSearch = async () => {
    // Validate inputs
    if (!origin || !destination || !date) {
      setError('Please fill all search fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE}/${mode}s?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Combined sorting function (single pass)
  const applyFilters = () => {
    return [...results].sort((a, b) => {
      // Price sort
      if (filters.price === 'asc' && a.price !== b.price) {
        return a.price - b.price;
      } else if (filters.price === 'desc' && a.price !== b.price) {
        return b.price - a.price;
      }
      
      // Rating sort (only if prices are equal)
      if (filters.rating === 'asc') {
        return a.rating - b.rating;
      } else {
        return b.rating - a.rating;
      }
    });
  };

  return (
    <div className="booking-container">
      <h2>Book Your Travel</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <label>
          Travel Mode:
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            disabled={isLoading}
          >
            <option value="flight">✈️ Flight</option>
            <option value="train">🚆 Train</option>
            <option value="bus">🚌 Bus</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="From (City/Airport)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="text"
          placeholder="To (City/Airport)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
          min={new Date().toISOString().split('T')[0]}
        />

        <button 
          onClick={handleSearch}
          disabled={isLoading || !origin || !destination || !date}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <h3>Sort By:</h3>
        <label>
          Price:
          <select
            value={filters.price}
            onChange={(e) => setFilters({...filters, price: e.target.value})}
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </label>

        <label>
          Rating:
          <select
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </label>
      </div>

      {/* Results */}
      <div className="results-section">
        <h3>Available Options</h3>
        
        {isLoading ? (
          <div className="loader">Loading...</div>
        ) : results.length === 0 ? (
          <p>No travel options found. Try different search criteria.</p>
        ) : (
          <ul>
            {applyFilters().map((item) => (
              <li key={item.id} className="result-card">
                <h4>{item.name}</h4>
                <p>📍 {item.origin} → {item.destination}</p>
                <p>🕒 {new Date(item.departure).toLocaleString()}</p>
                <p>💺 Seats: {item.availableSeats}</p>
                <p>💰 Price: ${item.price.toFixed(2)}</p>
                <p>⭐ Rating: {item.rating}/5</p>
                <button 
                  onClick={() => window.open(item.bookingLink, '_blank')}
                  aria-label={`Book ${item.name}`}
                >
                  Book Now
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Booking;


/*
//Add css changes 
.booking-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.result-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.loader {
  text-align: center;
  padding: 20px;
}


@media (max-width: 768px) {
  .search-section {
    grid-template-columns: 1fr;
  }
}
*/