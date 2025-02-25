const API_URL = 'http://localhost:3001/api';

// Default data structure - now just for reference, actual defaults are on server
const defaultData = {
  users: [{
    id: "1",
    username: "admin",
    password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
    role: "user",
    createdAt: new Date().toISOString()
  }],
  visitedRestaurants: [],
  toVisit: [],
  recommended: []
};

// Load data from server
const loadData = async () => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) throw new Error('Failed to load data from server');
    return await response.json();
  } catch (error) {
    console.error('Error loading data from server:', error);
    return defaultData;
  }
};

// Save data to server
const saveData = async (data) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication required');
    
    // Update each key separately
    for (const key of Object.keys(data)) {
      const response = await fetch(`${API_URL}/data/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ value: data[key] })
      });
      
      if (!response.ok) throw new Error(`Failed to save ${key} data`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving data to server:', error);
    return false;
  }
};

export { loadData, saveData, defaultData };
