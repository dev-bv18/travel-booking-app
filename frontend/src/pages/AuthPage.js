import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP, LOGIN } from '../graphql/mutation';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from './NavBar';
import {jwtDecode} from 'jwt-decode';
import Footer from './Footer';
import bgImage from '../assests/login.gif'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { decode } from 'punycode';

const AuthPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUp] = useMutation(SIGN_UP);
  const [login] = useMutation(LOGIN);
  const navigate = useNavigate();
  const handlelogo=()=>navigate('/');

  const toastOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };
  const validatePassword = (password) => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.', toastOptions);
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter.', toastOptions);
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Password must contain at least one lowercase letter.', toastOptions);
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


  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp && !validatePassword(form.password)) {
      return; // Stop if password validation fails
    }
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
          console.log(decoded.role);
          localStorage.setItem('auth-token', token);
          localStorage.setItem('user-id', decoded.id);
          localStorage.setItem('email', form.email);
          localStorage.setItem('username',decoded.username);
         localStorage.setItem('role',decoded.role);
         toast.success('Login successful!', toastOptions);
         setTimeout(() => {
          navigate("/");
          }, 3000);
        } else {
          throw new Error('Invalid login response');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error during authentication', toastOptions);
      setAuthError(err.message || 'Error during authentication');
    }
  };

  return (<div><NavBar />
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
        <SubmitButton type="submit">{isSignUp ? 'Sign Up' : 'Login'}</SubmitButton>
        <SwitchButton
          onClick={(e) => {
            e.preventDefault();
            setIsSignUp(!isSignUp);
          }}
        >
          {isSignUp ? 'Already registered? Login!' : "Don't have an account? Register now!"}
        </SwitchButton>
        
      <Logo onClick={handlelogo}>Tripify</Logo>
      </AuthForm>
      {authError && <ErrorText>{authError}</ErrorText>}
    </AuthContainer>
    <ToastContainer />
    <Footer/></div>
  
  );
};

export default AuthPage;

// Styled Components
const Logo=styled.p`
color:teal;
font-family:lemon;
float:right;
font-weight:700;
padding-left:0px;
margin:0px;
cursor:pointer;
`;
const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url(${bgImage}) no-repeat center center/cover;
  position: relative; /* Set position to relative to position the overlay */

  /* Add an overlay using a pseudo-element */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgb(12, 0, 0),rgba(12, 0, 0, 0.55)); /* Black overlay with 50% opacity */
    z-index: 1; /* Ensure the overlay is below the form */
  }

  /* Ensure children elements are above the overlay */
  > * {
    position: relative;
    z-index: 2;
  }

  padding: 20px;
`;

const AuthForm = styled.form`
  background-color: #ffffff;
  padding: 40px;
  padding-bottom:20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const FormTitle = styled.h2`
  font-size: 2.8rem;
  font-weight:800;
  font-family:'Arial';
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
  color:teal;
  font-size: 1rem;
  text-decoration: underline;
  border: none;
  padding-right:0px;
  position:relative;
  right:-15px;
  cursor: pointer;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 10px;
  bottom:120px;
  position:absolute;
`;