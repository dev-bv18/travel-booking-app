// src/components/LoadingScreen.js
import React from 'react';
import image from '../assests/empty.jpg';
import './Empty.css';

const LoadingScreen = () => {
  return (<div className='empty'>
      <img src={image} alt="empty" />
      </div>
  );
};

export default LoadingScreen;
