import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKING_HISTORY } from '../graphql/queries';
import Navbar from './NavBar';
import './BookingHistory.css';
import LoadingScreen from './LoadingScreen';
import Empty from './Empty';
import {useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const BookingHistory = () => {
  const { userId } = useParams(); 
  const [filterOption, setFilterOption] = useState('all');
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [username, setUsername] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const { loading, error, data, refetch } = useQuery(GET_BOOKING_HISTORY, {
    variables: { userId },
    skip: !userId,
    onError: () => {
      refetch();
    },
  });
  const navigate = useNavigate();
   useEffect(() => {
      window.scrollTo(0, 0); 
    }, []);
    const filterBookings = (bookings) => {
      if (filterOption === 'confirmed') {
        return bookings.filter((booking) => booking.status === 'Confirmed');
      } else if (filterOption === 'pending') {
        return bookings.filter((booking) => booking.status === 'Pending');
      }
      return bookings; // return all bookings if 'all' is selected
    };
    
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const storedUserId = localStorage.getItem('user-id');
    const storedUsername = localStorage.getItem('selected-username'); // Get username from localStorage
    console.log(token + " and this " + storedUserId);

    if (!token || !storedUserId) {
      alert('Please log in to view your booking history.');
      navigate('/auth');
      return;
    }

    // Display loading screen for 2 seconds
    setUsername(storedUsername || 'User');
    setTimeout(() => setShowLoadingScreen(false), 2000);
  }, []);
  
  useEffect(() => {
    if (error) {
      navigate('/auth');
    }
  }, [error]);
  useEffect(() => {
   
  
    if (userId) {
      refetch(); // Refetch data when userId is updated
    }
  }, [userId, refetch]);

  if (showLoadingScreen) {
    return (
      <div>
        <Navbar />
        <LoadingScreen />
      </div>
    );
  }

  if (!userId || loading) {
    return (
      <div>
        <Navbar />
        <p>Loading booking history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <Empty/>
        <div>
      {error && <p>Error: {error.message}</p>}
      {/* Other components */}
    </div>
      </div>
    );
  }

  const bookingHistory = data?.getBookingHistory || [];
 console.log(bookingHistory[0]);
 const sortBookings = (bookings) => {
  const sortedBookings = [...bookings];

  if (sortOption === 'dateAsc') {
    return sortedBookings.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date (oldest first)
  } else if (sortOption === 'dateDesc') {
    return sortedBookings.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
  } else if (sortOption === 'priceAsc') {
    return sortedBookings.sort((a, b) => a.package.price - b.package.price); // Sort by price (low to high)
  } else if (sortOption === 'priceDesc') {
    return sortedBookings.sort((a, b) => b.package.price - a.package.price); // Sort by price (high to low)
  }

  return sortedBookings;
};

const filteredBookings = filterBookings(bookingHistory);
const sortedBookings = sortBookings(filteredBookings);

  return (
    <div>
      <Navbar />
      <div className="booking-history">
        <h3>Welcome back &#9992;</h3>
        <h1>{username}'s Booking History </h1>
        <div className='booking-history-options'>
        <div className="filter-container">
  <label htmlFor="filter">Filter by status: </label>
  <select
    id="filter"
    onChange={(e) => setFilterOption(e.target.value)}
    value={filterOption}
  >
    <option value="all">All</option>
    <option value="confirmed">Confirmed</option>
    <option value="pending">Pending</option>
  </select>
</div>

        <div className="sort-container">
  <label htmlFor="sort">Sort by: </label>
  <select
    id="sort"
    onChange={(e) => setSortOption(e.target.value)}
    value={sortOption}
  >
    <option value="dateDesc">Booking Date (Newest First)</option>
    <option value="dateAsc">Booking Date (Oldest First)</option>
    <option value="priceAsc">Price (Low to High)</option>
    <option value="priceDesc">Price (High to Low)</option>
  </select>
</div>
        </div>
      

        {sortedBookings.length === 0 ? (
          <div>
         <Empty/>
         <p id="message"> No bookings yet!.</p>
        </div>) : (

        <ul className='bookings-list'>
        {sortedBookings.map((booking) => (
          <li key={booking.id} className="booking-card" 
          onClick={() =>navigate(`/booking-details/${booking.id}`,{state:booking})}>
            {booking.package ? (
              <>
                <h2>{booking.package.title}</h2>
                <p>
                  <strong>Destination:</strong> {booking.package.destination}
                </p>
                <p>
                  <strong>Booking Date:</strong> {booking.date}
                </p>
                <p>₹{booking.package.price}</p>
                <p id="status">
                  {booking.status + (booking.status === 'Confirmed' ? ' ✅' : ' ❌')}
                </p>
              </>
            ) : (
              <p>Package information is unavailable.</p>
            )}
          </li>
        ))}
      </ul>
      
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default BookingHistory;
