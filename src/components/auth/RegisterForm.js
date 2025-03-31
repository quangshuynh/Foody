import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { register, googleSignIn } from '../../services/authService';
import { checkUsernameExists } from '../../services/userService'; 
import debounce from '../../utils/debounce'; 
import Modal from './Modal';
import { FaEye } from 'react-icons/fa';

const FormContainer = styled.div`
  width: 400px;          
  min-height: 370px;      
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

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 2px 0;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${props => (props.active ? 'red' : '#f5f5f5')};
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

const GoogleButton = styled(Button)`
  background: #db4437;
  &:hover {
    background: #c23321;
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

const ErrorMessage = styled.p`
  color: #ff4081;
  margin: 10px 0;
  text-align: center;
`;

function RegisterForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const debouncedCheckUsername = useCallback(
    debounce(async (name) => {
      if (!name || name.length < 3) {
        setUsernameAvailable(true);
        setUsernameLoading(false);
        return;
      }
      setUsernameLoading(true);
      try {
        const exists = await checkUsernameExists(name);
        setUsernameAvailable(!exists);
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameAvailable(false); 
        setError("Could not verify username. Please try again."); 
      } finally {
        setUsernameLoading(false);
      }
    }, 500), 
    [] 
  );

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    const validUsername = /^[a-zA-Z0-9_-]*$/.test(newUsername);
    if (!validUsername) {
      setError("Username can only contain letters, numbers, underscores, and dashes.");
      return; 
    }
    setError(''); 
    setUsername(newUsername);
    setUsernameLoading(true); 
    setUsernameAvailable(true);
    debouncedCheckUsername(newUsername);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); 

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }
    if (!usernameAvailable || usernameLoading) {
      setError('Please choose an available username.');
      setLoading(false);
      return;
    }

    try {
      setUsernameLoading(true);
      const exists = await checkUsernameExists(username);
      setUsernameLoading(false);
      if (exists) {
        setUsernameAvailable(false);
        setError('Username is already taken.');
        setLoading(false);
        return;
      }
      setUsernameAvailable(true);

      await register(username, email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false); 
    }
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
        <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Register</h2>
        <form 
          onSubmit={handleSubmit} 
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Input
            type="text"
            placeholder="Username (min. 3 chars, a-z, 0-9, _, -)"
            value={username}
            onChange={handleUsernameChange}
            required
            aria-invalid={!usernameAvailable}
            aria-describedby="username-status"
          />
          <div 
            id="username-status" 
            style={{ height: '1.2em', fontSize: '0.8em', color: usernameAvailable ? 'lightgreen' : '#ff4081' }}
          >
            {usernameLoading
              ? 'Checking...'
              : (username && username.length >= 3 ? (usernameAvailable ? 'Available' : 'Username taken') : '')
            }
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputWrapper>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && (
              <IconWrapper
                active={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                <FaEye />
              </IconWrapper>
            )}
          </InputWrapper>
          <InputWrapper>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword.length > 0 && (
              <IconWrapper
                active={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FaEye />
              </IconWrapper>
            )}
          </InputWrapper>
          <GoogleButton type="button" onClick={handleGoogleSignIn}>
            Continue with Google
          </GoogleButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={loading || usernameLoading || !usernameAvailable}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </FormContainer>
    </Modal>
  );
}

export default RegisterForm;
