import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsernameExists, createUserProfile } from '../../services/userService';
import debounce from '../../utils/debounce';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85); /* Darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Ensure it's above other modals */
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-family: 'rushdriver', sans-serif;
  margin-bottom: 15px;
  color: #00bcd4;
`;

const InfoText = styled.p`
  color: #ccc;
  margin-bottom: 20px;
  font-size: 0.95rem;
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
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4081;
  margin: 10px 0;
  text-align: center;
  height: 1.2em; /* Reserve space */
`;

const UsernameStatus = styled.div`
  height: 1.2em;
  font-size: 0.8em;
  color: ${props => props.available ? 'lightgreen' : '#ff4081'};
`;

function UsernamePromptModal() {
  const { user, refreshUserProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounced username check (same as RegisterForm)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!user || !user.email) {
        setError('User information is missing. Please try logging out and back in.');
        setLoading(false);
        return;
    }

    // Final check before submitting
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

        // Create the user profile
        await createUserProfile(user.uid, username, user.email);
        console.log("User profile created successfully for existing user:", user.uid);
        // Refresh the profile data in AuthContext
        refreshUserProfile();
        // Modal will close automatically when profileMissing becomes false in App.js
    } catch (err) {
        setError(err.message || 'Failed to set username');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>Choose Your Username</Title>
        <InfoText>
          To participate fully (like commenting), please choose a unique username.
          This will be displayed publicly.
        </InfoText>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Input
            type="text"
            placeholder="Username (min. 3 chars, a-z, 0-9, _, -)"
            value={username}
            onChange={handleUsernameChange}
            required
            aria-invalid={!usernameAvailable}
            aria-describedby="username-status-prompt"
          />
          <UsernameStatus id="username-status-prompt" available={usernameAvailable}>
            {usernameLoading ? 'Checking...' : (username && username.length >= 3 ? (usernameAvailable ? 'Available' : 'Username taken') : '')}
          </UsernameStatus>
          <ErrorMessage>{error}</ErrorMessage>
          <Button type="submit" disabled={loading || usernameLoading || !usernameAvailable || !username || username.length < 3}>
            {loading ? 'Saving...' : 'Set Username'}
          </Button>
        </form>
        {/* Optional: Add a logout button if they don't want to choose now? */}
      </ModalContent>
    </ModalOverlay>
  );
}

export default UsernamePromptModal;
