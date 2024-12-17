// src/components/NavBar.js

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState("user"); // Default role is 'user'
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const storedUserId = localStorage.getItem("user-id");
    const storedEmail = localStorage.getItem("email");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // Retrieve user role

    if (token && storedUserId && storedEmail) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      setEmail(storedEmail);
      setUsername(storedUsername);
      setRole(storedRole || "user"); // Set role or default to 'user'
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    navigate("/auth"); 
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Tripify
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        {isLoggedIn ? (
          <div className="dropdown">
            <span className="nav-link dropdown-toggle" onClick={toggleDropdown}>
              {username} 
            </span>
            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/booking-history" className="dropdown-item">
                  Booking History
                </Link>
                {role === "admin" && (
                  <Link to="/admin" className="dropdown-item">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="dropdown-item logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
