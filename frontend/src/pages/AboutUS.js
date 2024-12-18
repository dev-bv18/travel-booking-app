// src/pages/PackagesPage.js

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Navbar from './NavBar';
import LoadingScreen from './LoadingScreen';
import Footer from './Footer';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const PageContainer = styled.div`
font-family: Arial, sans-serif;
padding: 20px;
`;

const PackagesPage = () => {
const [aboutUsContent, setAboutUsContent] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('https://example.com/api/about-us') // Replace with your API endpoint
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => setAboutUsContent(data))
    .catch((err) => setError(err.message));
}, []);

return (
  <PageContainer>
    <Navbar />
    <div className="banner">
      {error && <p>Sorry, we are unable to load the About Us content at this time.</p>}
      {aboutUsContent && (
        <div id="about-us">
          <h1>About Us</h1>
    <p>Welcome to <strong>Tripify</strong>, your trusted partner in exploring the world!</p>

    <p>We believe that every journey tells a story, and our mission is to make your travel dreams come true with ease, affordability, and convenience. Whether you’re planning a weekend getaway, a family vacation, or an adventure of a lifetime, we’re here to help you every step of the way.</p>

    <h2>Why Choose Us?</h2>
    <ul>
      <li><strong>Comprehensive Options</strong>: Browse thousands of destinations, flights, hotels, and travel packages tailored to your preferences.</li>
      <li><strong>Best Deals Guaranteed</strong>: We partner with top providers to ensure you get unbeatable prices and exclusive offers.</li>
      <li><strong>User-Friendly Experience</strong>: With our seamless booking process and intuitive platform, planning your trip has never been easier.</li>
      <li><strong>24/7 Support</strong>: Our dedicated customer service team is always ready to assist you, ensuring your travel experience is stress-free from start to finish.</li>
    </ul>

    <p>At <strong>[Your Travel Booking Website Name]</strong>, we’re passionate about helping you discover new places, create unforgettable memories, and explore the beauty of the world.</p>

    <p>Start planning your next adventure with us today and let’s turn your travel aspirations into reality!</p>
        </div>
      )}
    </div>
    <Footer />
  </PageContainer>
);
};

const PackagesContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const PackageCard = styled.div`
  background: linear-gradient(-90deg,
    rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.47),
    rgba(0, 0, 0, 0.79) 
  ), url(${(props) => props.backgroundimage});
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  overflow: hidden;
  width: 40%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

const Content = styled.div`
padding-bottom:40px;`;
const PackageTitle = styled.h2`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Destination = styled.p`
  font-size: 1.2rem;
  color:rgb(128, 210, 222);
  margin-bottom: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Detail = styled.p`
  font-size: 1rem;
  color:rgb(201, 201, 201);
`;

const Description = styled.p`
  font-size: 1rem;
  color:rgb(219, 244, 242);
  margin-bottom: 20px;
`;

const Price = styled.p`
  font-size: 1.5rem;
  color:rgb(0, 202, 3);
  font-weight: bold;
  margin-bottom: 20px;
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  color: #adb5bd;
`;

const BookButton = styled.button`
  background: teal;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  float: right;
  transition: background 0.3s;

  /* Disabled state */
  &:disabled {
    background: rgb(1, 76, 68);
    color:grey;
    cursor: not-allowed;
  }

  /* Hover state */
  &:hover {
    background: rgb(1, 76, 68);
    color: yellow;
  }
`;


