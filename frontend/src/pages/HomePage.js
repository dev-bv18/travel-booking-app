import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import { BOOK_PACKAGE } from '../graphql/mutation';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from './NavBar';

// Import the background image
import bgImage from '../assests/herobg.jpg';

const HomePage = () => {
  const { loading, error, data } = useQuery(GET_PACKAGES);
  const [bookPackage] = useMutation(BOOK_PACKAGE);
  const navigate = useNavigate();

  // Redirect to login
  const handleLoginRedirect = () => {
    navigate('/auth'); // Redirect to login/signup page
  };

  // Handle booking for a logged-in user
  const handleBooking = async (packageId) => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      alert('Please log in to make a booking.');
      handleLoginRedirect();
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0]; // Get today's date
      const response = await bookPackage({
        variables: { packageId, date },
      });
      alert(`Booking successful for ${response.data.bookPackage.package.title}`);
    } catch (err) {
      console.error('Error booking package:', err);
      alert('Error while booking the package.');
    }
  };

  if (loading) return <p>Loading travel packages...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <Navbar />
      <div
        className="homepage"
        style={{
          height: '100vh',
          background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <h1 className="heading">Available Travel Packages</h1>

        {/* Travel Packages List */}
        <div className="package-list">
          {data.getPackages.map((pkg) => (
            <div className="package-card" key={pkg.id}>
              <h2>{pkg.title}</h2>
              <p className="place">{pkg.destination}</p>
              <div className="info">
                <div className="right-info">
                  <p><strong>Duration:</strong> {pkg.duration}</p>
                  <p>
                    <strong>Availability:</strong>{' '}
                    {pkg.availability <= 10
                      ? `${pkg.availability} (few left)`
                      : pkg.availability}
                  </p>
                  <p id="desc">{pkg.description}</p>
                </div>
                <p className="price">
                  <span>${pkg.price + pkg.price * 0.1}</span> ${pkg.price}
                </p>
              </div>
              <button
                className="add-to-booking"
                onClick={() => handleBooking(pkg.id)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
