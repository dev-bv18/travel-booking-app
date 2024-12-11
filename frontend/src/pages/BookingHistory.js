import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKING_HISTORY } from '../graphql/queries';
import Navbar from './NavBar';
import './BookingHistory.css';
import LoadingScreen from './LoadingScreen';

const BookingHistory = () => {
  const [userId, setUserId] = useState(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true); // State to control the loading screen visibility
  const { loading, error, data, refetch } = useQuery(GET_BOOKING_HISTORY, {
    variables: { userId },
    skip: !userId, // Skip query execution until userId is available
  });

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const storedUserId = localStorage.getItem('user-id');
    console.log(token + " and this " + storedUserId);

    if (!token || !storedUserId) {
      alert('Please log in to view your booking history.');
      window.location.href = '/auth';
      return;
    }

    setUserId(storedUserId);

    // Display loading screen for 2 seconds
    setTimeout(() => setShowLoadingScreen(false), 2000);
  }, []);
  

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
        <p>Error: {error.message}</p>
      </div>
    );
  }

  const bookingHistory = data?.getBookingHistory || [];

  return (
    <div>
      <Navbar />
      <div className="booking-history">
        <h1>Your Booking History</h1>
        {bookingHistory.length === 0 ? (
          <p>You have no bookings yet. Explore packages to start your journey!</p>
        ) : (
          <ul>
            {bookingHistory.map((booking) => (
              <li key={booking.id} className="booking-card">
                <h2>{booking.package.title}</h2>
                <p>
                  <strong>Destination:</strong> {booking.package.destination}
                </p>
                <p>
                  <strong>Booking Date:</strong> {booking.date}
                </p>
                <p id="status">
                  {booking.status + (booking.status === 'Confirmed' ? ' ✅' : ' ❌')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
