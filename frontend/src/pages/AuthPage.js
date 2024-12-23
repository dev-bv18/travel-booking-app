import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP, LOGIN } from '../graphql/mutation';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from './NavBar';
import { jwtDecode } from 'jwt-decode';
import Footer from './Footer';
import bgImage from '../assests/login.gif';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUp] = useMutation(SIGN_UP);
  const [login] = useMutation(LOGIN);
  const navigate = useNavigate();

  const toastOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validatePasswordOnConfirm = () => {
    const { password } = form;

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.', toastOptions);
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter.', toastOptions);
      return false;
    }
    if (!/\d/.test(password)) {
      toast.error('Password must contain at least one number.', toastOptions);
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one special character.', toastOptions);
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const { password, confirmPassword, username, email } = form;

    if (isSignUp) {
      if (username.length < 3) {
        toast.error('Username must be at least 3 characters long.', toastOptions);
        return false;
      }
    }

    if (!validatePasswordOnConfirm()) {
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isSignUp) {
        await signUp({ variables: { ...form } });
        toast.success('Sign-up successful! Please log in.', toastOptions);
        setIsSignUp(false);
      } else {
        const { data } = await login({ variables: { email: form.email, password: form.password } });
        const token = data?.loginUser;
        if (token) {
          const decoded = jwtDecode(token);
          localStorage.setItem('auth-token', token);
          localStorage.setItem('user-id', decoded.id);
          localStorage.setItem('email', form.email);
          localStorage.setItem('username', decoded.username);
          localStorage.setItem('role', decoded.role);
          toast.success('Login successful!', toastOptions);
          navigate('/');
        } else {
          throw new Error('Invalid login response');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error during authentication', toastOptions);
    }
  };

  return (
    <>
      <NavBar />
      <AuthContainer>
        <AuthForm onSubmit={handleSubmit}>
          <FormTitle>{isSignUp ? 'Sign Up' : 'Login'}</FormTitle>
          {isSignUp && (
            <FormInput
              type="text"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
            />
          )}
          <FormInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <FormInput
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          {isSignUp && (
            <FormInput
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) => {
                handleInputChange(e);
                validatePasswordOnConfirm();
              }}
              placeholder="Confirm Password"
              required
            />
          )}
          {isSignUp && (
            <FormSelect name="role" value={form.role} onChange={handleInputChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </FormSelect>
          )}
          <SubmitButton type="submit">{isSignUp ? 'Sign Up' : 'Login'}</SubmitButton>
          <SwitchButton
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(!isSignUp);
            }}
          >
            {isSignUp ? 'Already registered? Login!' : "Don't have an account? Register now!"}
          </SwitchButton>
          <Logo onClick={() => navigate('/')}>Tripify</Logo>
        </AuthForm>
      </AuthContainer>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default AuthPage;

// Styled Components
const Logo = styled.p`
  color: teal;
  font-family: lemon;
  float: right;
  font-weight: 700;
  padding-left: 0px;
  margin: 0px;
  cursor: pointer;
`;

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url(${bgImage}) no-repeat center center/cover;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgb(12, 0, 0), rgba(12, 0, 0, 0.55));
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2;
  }

  padding: 20px;
`;

const AuthForm = styled.form`
  background-color: #ffffff;
  padding: 40px;
  padding-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const FormTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  font-family: 'Arial';
  margin-top: 5px;
  color: teal;
  margin-bottom: 20px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: teal;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: teal;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  margin: 20px 0;
  background-color: teal;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: rgb(14, 95, 98);
  }
`;

const SwitchButton = styled.button`
  background: none;
  color: teal;
  font-size: 1rem;
  text-decoration: underline;
  border: none;
  padding-right: 0px;
  position: relative;
  right: -15px;
  cursor: pointer;
`;