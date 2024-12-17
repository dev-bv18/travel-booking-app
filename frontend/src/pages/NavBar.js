// src/components/NavBar.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username,setUsername]=useState(null);
  const [email,setEmail]=useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const storedUserId = localStorage.getItem('user-id');
    const storesEmail=localStorage.getItem('email'); 
    const storedUsername=localStorage.getItem('username'); // Retrieve user-id from localStorage

    if (token && storedUserId && storesEmail) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      setEmail(storesEmail);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-id');
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    navigate('/auth'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">Tripify</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        {isLoggedIn ? (
          <>
            <Link to="/booking-history" className="nav-link">
            <span className="nav-link">{username}</span></Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/auth" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
