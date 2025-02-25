const API_URL = 'http://localhost:3001/api';

export const initializeStorage = async () => {
  try {
    const response = await fetch(`${API_URL}/data/users`);
    if (!response.ok) throw new Error('Failed to initialize storage');
    return await response.json();
  } catch (error) {
    console.error('Error initializing storage:', error);
    return [];
  }
};

export const readFromStorage = async (key) => {
  try {
    const response = await fetch(`${API_URL}/data/${key}`);
    if (!response.ok) throw new Error(`Failed to read ${key} from storage`);
    return await response.json();
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
};

export const writeToStorage = async (key, data) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/data/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ value: data })
    });
    
    if (!response.ok) throw new Error(`Failed to write ${key} to storage`);
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
    return false;
  }
};
