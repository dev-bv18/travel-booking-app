// src/pages/PackagesPage.js

import React from 'react';
import styled from 'styled-components';
import Navbar from './NavBar';
import Footer from './Footer';
const PageContainer = styled.div`
font-family: Arial, sans-serif;
padding: 20px;
`;

const AboutUs = () => {
return (
  <PageContainer>
    <Navbar />
    <Container>
      <AbouUsContainer>
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

    <p>At <strong>Tripify</strong>, we’re passionate about helping you discover new places, create unforgettable memories, and explore the beauty of the world.</p>

    <p>Start planning your next adventure with us today and let’s turn your travel aspirations into reality!</p>
    </AbouUsContainer>
    </Container>
    <Footer />
  </PageContainer>
);
};
export default AboutUs;
const Container=styled.div`
margin:20px;
margin-top:80px;
background:teal;
border-radius:30px;
box-shadow:2px 2px 10px rgba(0, 0, 0, 0.21);

`;
const AbouUsContainer=styled.div`
padding:20px;
flex-direction:column;
display:flex;
h1{
color:white;
text-align:center;}
p{
color:rgb(158, 198, 200);}
p strong{
font-family:lemon;
color:yellow;}
`;


