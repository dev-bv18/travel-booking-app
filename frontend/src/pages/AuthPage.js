import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP, LOGIN } from '../graphql/mutation';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { jwtDecode } from 'jwt-decode';

const AuthPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign-Up and Login
  const [signUp] = useMutation(SIGN_UP);
  const [login] = useMutation(LOGIN);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(''); // Clear any previous errors
    try {
      if (isSignUp) {
        // Sign up user
        const { data } = await signUp({ variables: { ...form } });
        alert('Sign-up successful! Please log in.');
        setIsSignUp(false); // Switch to login form
      } else {
        // Login user
        const { data } = await login({ variables: { email: form.email, password: form.password } });

        // Check if login response has the expected token
        if (data?.loginUser) {
          const token = data.loginUser; // Adjust if the token is in a different structure (e.g., data.loginUser.token)

          // Decode token to extract user information
          const decoded = jwtDecode(token);
          const userId = decoded.id;
          const email = decoded.email; // Ensure email exists in the token

          // Store token, userId, and email in localStorage
          localStorage.setItem('auth-token', token);
          localStorage.setItem('user-id', userId);
          localStorage.setItem('email', email); // Correctly storing email

          alert('Login successful!');
          navigate('/'); // Redirect to home page
        } else {
          throw new Error('Invalid login response');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Error during authentication');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="auth-page">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
          {isSignUp && (
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          {isSignUp && (
            <div>
              <select name="role" value={form.role} onChange={handleInputChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
          <button
            id="login-switch"
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(!isSignUp); // Toggle between SignUp and Login
            }}
          >
            {isSignUp ? 'Already registered? Login!' : "Don't have an account? Register now!"}
          </button>
        </form>

        {authError && <p className="error">{authError}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
