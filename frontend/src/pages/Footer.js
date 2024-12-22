import React from 'react';
import './Footer.css';

const Footer = () => {
  
  const storedUserId = localStorage.getItem("user-id");
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>About Tripify</h3>
          <p>
            Discover the world with Tripify, your one-stop destination for curated travel experiences.
            Explore, book, and enjoy your journey with ease! &#9992;
          </p>
        </div>
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/packages">Packages</a></li>
             <li><a href={`/booking-history/${storedUserId}`}>Booking History</a></li>
             <li><a href="/aboutus">About Us</a></li>
          </ul>
        </div>
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: support@tripify.com</p>
          <p>Phone: +1-800-123-4567</p>
          <p>Address: 123 Travel Lane, Wanderlust City</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Tripify. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
