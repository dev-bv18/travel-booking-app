import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from './NavBar';

// Import images for the cards
import packagesImage from '../assests/package.jpg';
import cartImage from '../assests/cart.jpg';
import herobg from '../assests/herobg.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const handleViewBookingHistory = () => {
    navigate('/booking-history');
  };


  // Navigate to the "All Packages" page
  const handleAllPackages = () => {
    navigate('/packages');
  };

  // Navigate to the "User Cart" page
  const handleUserCart = () => {
    navigate('/cart');
  };

  return (
    <div>
      <Navbar />
      <div
        className="homepage"
        style={{
          height: '100vh',
          background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${herobg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <h1 className="heading">Welcome to <span>Tripify</span> ✈️
        </h1>
        <div className="card-container">
          <div
            className="card c1"
            style={{
              backgroundImage: `url(${packagesImage})`,
            }}
            onClick={handleAllPackages}
          >
            <h2>Explore Packages</h2>
            <p>Browse through our wide range of travel packages and make your trip memorable!</p>
          </div>
          <div
            className="card c2"
            style={{
              backgroundImage: `url(${cartImage})`,
            }}
            onClick={handleViewBookingHistory}
          >
            <h2>Your Bookings</h2>
            <p>View the travel packages you have booked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
