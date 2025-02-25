import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/authService';

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

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      setUser(data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  const handleContinueAsGuest = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <FormContainer>
      <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Login</Button>
      </form>
      <ContinueAsGuestButton type="button" onClick={handleContinueAsGuest}>
        Continue as Guest
      </ContinueAsGuestButton>
    </FormContainer>
  );
}

export default LoginForm;
