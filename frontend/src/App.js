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
import SecureContent from './components/SecureContent';
import UpdateContent from './components/UpdateContent';
import PaymentForm from './pages/PaymentForm';
import AboutUs from './pages/AboutUs';
import BookingDetails from './pages/BookingDetails';
import PackageDetails from './pages/PackageDetails';
import Recommendations from './components/Recommendations';
import ThemeRecommendations from './components/ThemeRecommendations';
import Chatbot from './components/Chatbot';
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
          <Route path="/admin" element={<AdminDashboard/>}/>
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/secure" element={<SecureContent/>}/>
          <Route path="/update" element={<UpdateContent/>}/>
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/aboutus" element={<AboutUs/>}/>
          <Route path="/booking-details/:id" element={<BookingDetails />} />
          <Route path="/booking-history/:userId" element={<BookingHistory />} />
          <Route path="/package-details/:id" element={<PackageDetails />} />
          <Route path="/recommend" element={<Recommendations />} /> 
          <Route path="/themes" element={<ThemeRecommendations />} />   

                  </Routes>
                  <Chatbot/>
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