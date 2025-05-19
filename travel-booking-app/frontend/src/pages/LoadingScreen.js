// src/components/LoadingScreen.js
import React from 'react';
import './LoadingScreen.css';
import image from '../assests/loading.gif';

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <img src={image} alt="Loading..." />
    </div>
  );
};

export default LoadingScreen;
