import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { updateUserProfile, linkGoogleAccount, unlinkGoogleAccount } from '../../services/authService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

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
  width: 95%;
  padding: 10px;
  margin: 10px 0;
  background: #262626;
  border: 1px solid #00bcd4;
  border-radius: 5px;
  color: #f5f5f5;
  font-size: 1rem;
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
  const [username, setUsername] = useState(userProfile.username || userProfile.displayName || "");
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isGoogleLinked = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({ username, email, password: password || undefined });
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

  return (
    <Modal onClose={onSuccess}>
      <FormContainer>
        <CloseButton onClick={onSuccess} aria-label="Close">×</CloseButton>
        <h2 style={{ fontFamily: 'rushdriver, sans-serif', marginBottom: '10px' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <Input
            id="username"
            type="text"
            placeholder="Change your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            id="email"
            type="email"
            placeholder="Change your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {user && (
            <UserIdDisplay>
              User ID: {user.uid}
            </UserIdDisplay>
          )}
          <Button type="submit" disabled={loading}>
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
