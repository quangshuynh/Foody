const TOKEN_KEY = 'auth_token';
 const USERS_KEY = 'users';

 // Initialize users from db.json if not exists
 const initializeUsers = () => {
   const users = localStorage.getItem(USERS_KEY);
   if (!users) {
     const initialUsers = [
       {
         id: "1",
         username: "admin",
         password: "admin123",
         role: "user",
         createdAt: new Date().toISOString()
       }
     ];
     localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
   }
 };

 export const register = async (username, password) => {
   initializeUsers();
   const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

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
   initializeUsers();
   const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
   const user = users.find(u => u.username === username && u.password === password);

   if (!user) {
     throw new Error('Invalid credentials');
   }

   const token = 'dummy-token-' + Date.now();
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
