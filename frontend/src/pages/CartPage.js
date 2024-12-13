import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import './CartPage.css';
import Footer from './Footer';

const CartPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const userId = localStorage.getItem('user-id');

    if (!token || !userId) {
      alert('Please log in to view your bookings.');
      return;
    }

    // Fetch bookings for the user
    fetch(`http://localhost:4000/api/bookings/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((error) => console.error('Error fetching bookings:', error));
  }, []);

  if (bookings.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="cart-page">
          <h1>Your Bookings</h1>
          <p>You have no bookings yet.</p>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="cart-page">
        <h1>Your Bookings</h1>
        <div className="cart-list">
          {bookings.map((booking) => (
            <div className="cart-card" key={booking.id}>
              <h2>{booking.package.title}</h2>
              <p className="place">{booking.package.destination}</p>
              <p><strong>Duration:</strong> {booking.package.duration}</p>
              <p className="price">₹{booking.package.price}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default CartPage;
