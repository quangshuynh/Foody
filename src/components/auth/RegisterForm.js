import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { register } from '../../services/authService';

const FormContainer = styled.div`
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #2a2a2a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const Input = styled.input`
  width: 80%;
  padding: 10px;
  margin: 10px 0;
  background: #262626;
  border: 1px solid #00bcd4;
  border-radius: 5px;
  color: #f5f5f5;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 80%;
  padding: 10px;
  background: #00bcd4;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  margin-top: 10px;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover {
    background: #00a1b5;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #f5f5f5;
  font-size: 1.2rem;
  cursor: pointer;
  &:hover {
    color: #ff4081;
  }
`;

const ContinueAsGuestButton = styled(Button)`
  background: #424242;
  margin-top: 15px;
  &:hover {
    background: #616161;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4081;
  margin: 10px 0;
  text-align: center;
`;

function RegisterForm({ onSuccess }) {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // Removed setUser from useAuth() - AuthContext handles state via onAuthStateChanged

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      // Call register with email and password
      await register(email, password);
      // No need to call setUser here, AuthContext listener will update the state
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  const handleContinueAsGuest = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <FormContainer>
      <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
      <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="email" // Changed type to email
          placeholder="Email" // Changed placeholder
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Changed handler
          required // Added required attribute
        />
        <Input
          type="password"
          placeholder="Password (min. 6 characters)" // Added hint
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required // Added required attribute
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required // Added required attribute
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Register</Button>
      </form>
      <ContinueAsGuestButton type="button" onClick={handleContinueAsGuest}>
        Continue as Guest
      </ContinueAsGuestButton>
    </FormContainer>
  );
}

export default RegisterForm;
