import React, { useState } from 'react';
import styled from 'styled-components';
import { login, googleSignIn } from '../../services/authService';
import Modal from './Modal'

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

const GoogleButton = styled(Button)`
  background: #db4437;
  &:hover {
    background: #c23321;
  }
`;

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  const handleContinueAsGuest = () => {
    if (onSuccess) onSuccess();
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Google sign in failed');
    }
  };

  return (
    <Modal onClose={onSuccess}>
      <FormContainer>
        <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
        <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit">Login</Button>
        </form>
        <GoogleButton type="button" onClick={handleGoogleSignIn}>
          Continue with Google
        </GoogleButton>
        <ContinueAsGuestButton type="button" onClick={handleContinueAsGuest}>
          Continue as Guest
        </ContinueAsGuestButton>
      </FormContainer>
    </Modal>
  );
}

export default LoginForm;