import React from 'react';
import './Footer.css';
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const gotobooking = () => {
    navigate(`/booking-history/${storedUserId}`);
  }
  const gotoabout = () => {
    navigate(`/aboutus`);
    }
    const gotopackage = () => {
      navigate(`/packages`);
    }
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
            <li onClick={()=>navigate('/')}>Home</li>
            <li onClick={gotopackage}>Packages</li>
             <li onClick={gotobooking}>Booking History</li>
             <li onClick={gotoabout}>About Us</li>
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
