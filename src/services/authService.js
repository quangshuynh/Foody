const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'users';

export const register = async (username, password) => {
  const users = readFromStorage(USERS_KEY) || [];

  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    password, // In a real app, this should be hashed
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
  const user = users.find(u => u.username === username && u.password === password);

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
