const API_URL = 'http://localhost:3001/api';

// Try to start the server if needed
const ensureServerRunning = async () => {
  try {
    // Check if server is running
    const response = await fetch(`${API_URL}/data`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(1000) 
    }).catch(() => null);
    
    if (response && response.ok) return;
    
    // If not running, try to import the server starter
    console.log('Server not responding, attempting to start...');
    try {
      const { startServerIfNeeded } = await import('../utils/startServer.js');
      const port = await startServerIfNeeded();
      if (port && port !== 3001) {
        console.log(`Server started on port ${port}, please refresh the page`);
        alert(`Server started on port ${port}, please refresh the page`);
      }
    } catch (err) {
      console.error('Failed to start server:', err);
    }
  } catch (err) {
    console.error('Error checking server status:', err);
  }
};

export const initializeStorage = async () => {
  await ensureServerRunning();
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
