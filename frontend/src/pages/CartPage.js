import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import './CartPage.css';

const CartPage = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      alert('Please log in to view your cart.');
      return;
    }

    // Fetch the user's cart from the backend
    fetch('http://localhost:4000/api/cart', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setCart(data))
      .catch((error) => console.error('Error fetching cart:', error));
  }, []);

  if (cart.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="cart-page">
          <h1>Your Cart</h1>
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="cart-page">
        <h1>Your Bookings</h1>
        <div className="cart-list">
          {cart.map((pkg) => (
            <div className="cart-card" key={pkg.id}>
              <h2>{pkg.title}</h2>
              <p className="place">{pkg.destination}</p>
              <p><strong>Duration:</strong> {pkg.duration}</p>
              <p className="price">${pkg.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
