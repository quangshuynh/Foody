import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
// Removed useAuth import as it's not used here directly for setting user
import { register } from '../../services/authService';
import { checkUsernameExists } from '../../services/userService'; // Import username check
import debounce from '../../utils/debounce'; // We'll create this utility

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
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For overall form submission

  // Debounced username check function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckUsername = useCallback(
    debounce(async (name) => {
      if (!name || name.length < 3) { // Basic validation
        setUsernameAvailable(true); // Don't show error for short/empty names
        setUsernameLoading(false);
        return;
      }
      setUsernameLoading(true);
      try {
        const exists = await checkUsernameExists(name);
        setUsernameAvailable(!exists);
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameAvailable(false); // Assume unavailable on error
        setError("Could not verify username. Please try again."); // Show specific error
      } finally {
        setUsernameLoading(false);
      }
    }, 500), // 500ms delay
    [] // No dependencies, function is stable
  );

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    // Basic validation for allowed characters (alphanumeric + underscore/dash)
    const validUsername = /^[a-zA-Z0-9_-]*$/.test(newUsername);
    if (!validUsername) {
        setError("Username can only contain letters, numbers, underscores, and dashes.");
        return; // Don't update state or check invalid username
    }
    setError(''); // Clear validation error
    setUsername(newUsername);
    setUsernameLoading(true); // Show loading indicator immediately
    setUsernameAvailable(true); // Reset availability state
    debouncedCheckUsername(newUsername);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Start loading indicator

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
        setUsernameAvailable(true); // Mark as available if check passes

        // Call register with username, email, and password
        await register(username, email, password);
        // No need to call setUser here, AuthContext listener will update the state
        if (onSuccess) onSuccess();
    } catch (err) {
        setError(err.message || 'Failed to register');
    } finally {
        setLoading(false); // Stop loading indicator
    }
  };

  const handleContinueAsGuest = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <FormContainer>
      <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
      <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Register</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Input
          type="text"
          placeholder="Username (min. 3 chars, a-z, 0-9, _, -)"
          value={username}
          onChange={handleUsernameChange}
          required
          aria-invalid={!usernameAvailable}
          aria-describedby="username-status"
        />
        <div id="username-status" style={{ height: '1.2em', fontSize: '0.8em', color: usernameAvailable ? 'lightgreen' : '#ff4081' }}>
          {usernameLoading ? 'Checking...' : (username && username.length >= 3 ? (usernameAvailable ? 'Available' : 'Username taken') : '')}
        </div>
        <Input
          type="email"
          placeholder="Email"
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
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={loading || usernameLoading || !usernameAvailable}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      {/* Guest button might be less relevant if registration is simple */}
      {/* <ContinueAsGuestButton type="button" onClick={handleContinueAsGuest}>
        Continue as Guest
      </ContinueAsGuestButton> */}
      {/* Removed duplicate closing tag above */}
    </FormContainer>
  );
}

export default RegisterForm;
