import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKING_HISTORY } from '../graphql/queries';
import Navbar from './NavBar';
import './BookingHistory.css';
import LoadingScreen from './LoadingScreen';
import Empty from './Empty';
import { Link ,useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const BookingHistory = () => {
  const { userId } = useParams(); 
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [username, setUsername] = useState('');
  const { loading, error, data, refetch } = useQuery(GET_BOOKING_HISTORY, {
    variables: { userId },
    skip: !userId,
    onError: () => {
      refetch();
    },
  });
  const navigate = useNavigate();

   useEffect(() => {
      window.scrollTo(0, 0); // Scrolls to the top when the component is mounted
    }, []);
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
  return (
    <div>
      <Navbar />
      <div className="booking-history">
        <h3>Welcome back &#9992;</h3>
        <h1>{username}'s Booking History </h1>
        {bookingHistory.length === 0 ? (
          <div>
         <Empty/>
         <p id="message"> No bookings yet!.</p>
        </div>) : (
        <ul className='bookings-list'>
        {bookingHistory.map((booking) => (
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
