import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { updateUserProfile, linkGoogleAccount, unlinkGoogleAccount } from '../../services/authService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import debounce from '../../utils/debounce';
import { checkUsernameExists } from '../../services/userService';
import { FaEye } from 'react-icons/fa';

const FormContainer = styled.div`
  width: 400px;
  min-height: 500px; /* increased height to accommodate additional fields */
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
  width: 100%;
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
  width: 95%;
  margin: -2px 0;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  /* Change icon color to red when active (i.e. when the password is visible) */
  color: ${props => (props.active ? 'red' : '#f5f5f5')};
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 12px 0;
  background: #00bcd4;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  &:hover {
    background: #0097a7;
  }
`;

const GoogleButton = styled(Button)`
  background: #db4437;
  &:hover {
    background: #c23321;
  }
`;

const UnlinkButton = styled(Button)`
  background: #f44336;
  &:hover {
    background: #d32f2f;
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

const UserIdDisplay = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #555;
`;

function ProfileForm({ onSuccess = () => {} }) {
  const { user, userProfile } = useAuth();
  const initialUsername = userProfile.username || userProfile.displayName || "";
  const [username, setUsername] = useState(initialUsername);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [email, setEmail] = useState(user.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

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
        if (exists && name !== initialUsername) {
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable(true);
        }
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameAvailable(false);
        toast.error("Could not verify username. Please try again.");
      } finally {
        setUsernameLoading(false);
      }
    }, 500),
    [initialUsername]
  );

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    const validUsername = /^[a-zA-Z0-9_-]*$/.test(newUsername);
    if (!validUsername) {
      toast.error("Username can only contain letters, numbers, underscores, and dashes.");
      return;
    }
    setUsername(newUsername);
    setUsernameLoading(true);
    setUsernameAvailable(true);
    debouncedCheckUsername(newUsername);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }
    if (!usernameAvailable || usernameLoading) {
      toast.error('Please choose an available username.');
      setLoading(false);
      return;
    }

    // Validate password change fields if any are provided
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error('Please enter your current password.');
        setLoading(false);
        return;
      }
      if (!newPassword) {
        toast.error('Please enter a new password.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New password and confirmation do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = { username, email };
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.password = newPassword;
      }
      await updateUserProfile(updateData);
      toast.success("Profile updated successfully!");
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await linkGoogleAccount();
      toast.success("Google account linked successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnlinkGoogle = async () => {
    try {
      await unlinkGoogleAccount();
      toast.success("Google account unlinked successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isGoogleLinked = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  );

  return (
    <Modal onClose={onSuccess}>
      <FormContainer>
        <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
        <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ width: '100%' }}>
            <p style={{ marginTop: '5px', marginBottom: '-3px', color: '#f5f5f5' }}>Username:</p>
            <Input
              id="username"
              type="text"
              placeholder="Change your username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <div style={{ fontSize: '0.8em', color: usernameAvailable ? 'lightgreen' : '#ff4081' }}>
              {usernameLoading
                ? 'Checking...'
                : (username && username.length >= 3 ? (usernameAvailable ? 'Available' : 'Username taken') : '')
              }
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <p style={{ marginTop: '10px', marginBottom: '-3px', color: '#f5f5f5' }}>Email:</p>
            <Input
              id="email"
              type="email"
              placeholder="Change your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ width: '100%' }}>
            <p style={{ marginTop: '10px', marginBottom: '-1px', color: '#f5f5f5' }}>Change Password:</p>
            <InputWrapper>
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {currentPassword.length > 0 && (
                <IconWrapper
                  active={showCurrentPassword}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <FaEye />
                </IconWrapper>
              )}
            </InputWrapper>
            <InputWrapper>
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword.length > 0 && (
                <IconWrapper
                  active={showNewPassword}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <FaEye />
                </IconWrapper>
              )}
            </InputWrapper>
            <InputWrapper>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          </div>
          {user && (
            <UserIdDisplay>
              User ID: {user.uid}
            </UserIdDisplay>
          )}
          <Button type="submit" disabled={loading || usernameLoading || !usernameAvailable}>
            {loading ? 'Applying Changes...' : 'Apply Changes'}
          </Button>
        </form>
        {isGoogleLinked ? (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <p style={{ color: '#00bcd4' }}>
              Your account is connected with Google.
            </p>
            <UnlinkButton type="button" onClick={handleUnlinkGoogle}>
              Disconnect Google Account
            </UnlinkButton>
          </div>
        ) : (
          <GoogleButton type="button" onClick={handleLinkGoogle}>
            Connect with Google
          </GoogleButton>
        )}
      </FormContainer>
    </Modal>
  );
}

export default ProfileForm;
