import { readFromStorage, writeToStorage } from './fileService';

const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'users';

// Simple hash function for demo purposes
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const register = async (username, password) => {
  const users = readFromStorage(USERS_KEY) || [];

  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    role: "user",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const token = 'dummy-token-' + Date.now();
  localStorage.setItem('user', JSON.stringify(newUser));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: newUser, token };
};

export const login = async (username, password) => {
  const users = readFromStorage(USERS_KEY) || [];
  const user = users.find(u => u.username === username);
  if (!user || !(await hashPassword(password) === user.password)) {
    throw new Error('Invalid credentials');
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const token = 'dummy-token-' + Date.now();
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);

  return { user, token };
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem(TOKEN_KEY);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};
