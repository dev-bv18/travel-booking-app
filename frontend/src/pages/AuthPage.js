import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP, LOGIN } from '../graphql/mutation';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import NavBar from './NavBar';

const AuthPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign-Up and Login
  const [signUp] = useMutation(SIGN_UP);
  const [login] = useMutation(LOGIN);
  const navigate = useNavigate(); // Initialize navigate function for redirection

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        // Sign up user
        await signUp({ variables: { ...form } });
        alert('Sign-up successful!');
        navigate('/'); // Redirect to home page after successful sign-up
      } else {
        // Login user
        const { data } = await login({ variables: { email: form.email, password: form.password } });
        const token = data.loginUser;
        localStorage.setItem('auth-token', token); // Store token in localStorage
        localStorage.setItem('user-email', form.email); // Store user email in localStorage (for display)
        alert('Login successful!');
        navigate('/'); // Redirect to home page after successful login
      }
    } catch (err) {
      setAuthError('Error during authentication');
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
              setIsSignUp(!isSignUp);
            }}
          >
            {isSignUp ? 'Already registered? Login!' : 'Don\'t have an account? Register now!'}
          </button>
        </form>

        {authError && <p className="error">{authError}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
