const API_URL = 'http://localhost:3001';
const TOKEN_KEY = 'auth_token';

export const register = async (username, password) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username, 
      password,
      role: "user",
      createdAt: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error('Registration failed. Please try again.');
  }
  
  const user = await response.json();
  const token = 'dummy-token-' + Date.now(); // Temporary token solution
  
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  
  return { user, token };
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Login failed');
  
  const users = await response.json();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) throw new Error('Invalid credentials');
  
  const token = 'dummy-token-' + Date.now(); // Temporary token solution
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  
  return { user, token };
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};
