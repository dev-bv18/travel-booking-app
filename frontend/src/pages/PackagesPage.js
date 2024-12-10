import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import Navbar from './NavBar';
import './PackagesPage.css';

const PackagesPage = () => {
  const { loading, error, data } = useQuery(GET_PACKAGES);

  if (loading) return <p>Loading travel packages...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <Navbar />
      <div className='banner'>
        <div className='left-banner'>Discount🏷️</div>
        <div className='right-banner'>Flat 50% off!</div>
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
                <p><strong>Available:</strong> {pkg.availability}</p>
              </div>
              <p className="desc">{pkg.description}</p>
              <p className="price"><span>₹{pkg.price + pkg.price * 0.50}</span> ₹{pkg.price}</p>
              <button className="btn-book">Book Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;
