// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloWrapper } from './apolloClient';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PackagesPage from './pages/PackagesPage';
import CartPage from './pages/CartPage';
import ConfirmBooking from './pages/ConfirmBooking';
import styled from "styled-components";
import BookingHistory from './pages/BookingHistory';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashBoard';

const App = () => {
  return (
    <ApolloWrapper>
      <Router>
        <AppContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/booking" element={<Booking/>}/>
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/admin" element={<AdminDashboard/>}/>
          <Route path="/confirm-booking" element={<ConfirmBooking />} />

                  </Routes>
        </AppContainer>
       
      </Router> 
    
    </ApolloWrapper>
  );
};

export default App;
const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  background: #f0f8ff;
  min-height: 100vh;
  flex-direction: column;
`;