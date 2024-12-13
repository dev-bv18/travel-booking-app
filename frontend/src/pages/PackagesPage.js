// src/pages/PackagesPage.js

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import { BOOK_PACKAGE } from '../graphql/mutation';
import Navbar from './NavBar';
import './PackagesPage.css';
import LoadingScreen from './LoadingScreen';
import Footer from './Footer';

const PackagesPage = () => {
  const { loading, error, data, refetch } = useQuery(GET_PACKAGES);
  const [bookPackage] = useMutation(BOOK_PACKAGE);
  const [showContent, setShowContent] = useState(false); // state to control when to show content

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowContent(true); // Show content after 2 seconds
      }, 2000);

      return () => clearTimeout(timeout); // Clean up timeout if the component is unmounted
    }
  }, [loading]);

  const handleBookPackage = async (packageId) => {
    const token = localStorage.getItem('auth-token');
    const userId = localStorage.getItem('user-id'); // Fetch user ID from localStorage

    if (!token || !userId) {
      alert('Please log in to book packages.');
      window.location.href = '/auth'; // Redirect to login if not logged in
      return;
    }

    try {
     //const date = new Date().toISOString().split('T')[0];
     const date= new Date().toLocaleDateString();// Use today's date
      const response = await bookPackage({
        variables: { packageId, userId, date },
      });

      if (response?.data?.bookPackage) {
        alert(`Booking successful for "${response.data.bookPackage.package.title}"!`);
        refetch(); // Refetch packages to update availability
      } else {
        alert('Failed to book the package. Please try again.');
      }
    } catch (err) {
      console.error('Error booking package:', err);
      alert('Error while booking the package.');
    }
  };

  if (loading || !showContent)
    return (
      <div>
        <Navbar />
        <LoadingScreen />
      </div>
    ); // Show loading screen until content is ready
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <Navbar />
      <div className="banner">
        <div className="left-banner">Discount🏷️</div>
        <div className="right-banner">Flat 50% off!</div>
      </div>
      <div className="packages-page">
        <h1 className="heading">Available Travel Packages</h1>
        <div className="package-list">
          {data.getPackages.map((pkg) => (
            <div className="package-card" key={pkg.id}>
              <h2>{pkg.title}</h2>
              <p className="place">{pkg.destination}</p>
              <div className="info">
                <p>{pkg.duration} itinerary</p>
                <p>
                  <strong>Available:</strong>{' '}
                  {pkg.availability < 10 ? (
                    <span className="blinking-text">{pkg.availability} (Few left)</span>
                  ) : (
                    pkg.availability
                  )}
                </p>
              </div>
              <p className="desc">{pkg.description}</p>
              <p className="price">
                <span>₹{pkg.price + pkg.price * 0.5}</span> ₹{pkg.price}
              </p>
              <button
                className="btn-book"
                onClick={() => handleBookPackage(pkg.id)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default PackagesPage;
