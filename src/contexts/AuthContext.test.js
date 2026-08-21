import { render, screen, waitFor } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider, useAuth } from './AuthContext';
import { getUserProfile } from '../services/userService';

jest.mock('../firebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn() }));
jest.mock('../services/userService', () => ({ getUserProfile: jest.fn() }));

const Consumer = () => {
  const { isAuthenticated, isGuest, userProfile, profileMissing } = useAuth();
  return <div>{JSON.stringify({ isAuthenticated, isGuest, userProfile, profileMissing })}</div>;
};

test('keeps children hidden until Firebase resolves authentication', () => {
  onAuthStateChanged.mockImplementation(() => jest.fn());

  render(<AuthProvider><Consumer /></AuthProvider>);

  expect(screen.queryByText(/isAuthenticated/)).not.toBeInTheDocument();
});

test('exposes guest mode without requesting a user profile', async () => {
  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(null);
    return jest.fn();
  });

  render(<AuthProvider><Consumer /></AuthProvider>);

  expect(await screen.findByText(/"isGuest":true/)).toHaveTextContent('"isAuthenticated":false');
  expect(getUserProfile).not.toHaveBeenCalled();
});

test('loads an authenticated user profile', async () => {
  getUserProfile.mockResolvedValue({ username: 'quang' });
  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback({ uid: 'user-1' });
    return jest.fn();
  });

  render(<AuthProvider><Consumer /></AuthProvider>);

  await waitFor(() => expect(screen.getByText(/quang/)).toHaveTextContent('"profileMissing":false'));
  expect(getUserProfile).toHaveBeenCalledWith('user-1');
});
