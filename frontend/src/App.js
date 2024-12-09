import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloWrapper } from './apolloClient';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PackagesPage from './pages/PackagesPage';
import CartPage from './pages/CartPage';

const App = () => {
  return (
    <ApolloWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </ApolloWrapper>
  );
};

export default App;
