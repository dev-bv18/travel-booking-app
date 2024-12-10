import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKING_HISTORY } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import './BookingHistory.css';

const BookingHistory = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user-id'); // Retrieve logged-in user ID from localStorage

  const { loading, error, data } = useQuery(GET_BOOKING_HISTORY, {
    variables: { userId },
  });

  useEffect(() => {
    if (!localStorage.getItem('auth-token')) {
      alert('Please log in to view booking history.');
      navigate('/auth');
    }
  }, [navigate]);

  if (loading) return <p>Loading booking history...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="booking-history">
      <h1>Your Booking History</h1>
      <ul>
        {data.getBookingHistory.map((booking) => (
          <li key={booking.id}>
            <h2>{booking.package.title}</h2>
            <p><strong>Destination:</strong> {booking.package.destination}</p>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Status:</strong> {booking.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingHistory;
