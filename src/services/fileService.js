import { getApiUrl, findAndUpdateApiUrl } from './apiConfig';

// Try to start the server if needed
const ensureServerRunning = async () => {
  try {
    // Check if server is running
    const response = await fetch(`${getApiUrl()}/data`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(1000) 
    }).catch(() => null);
    
    if (response && response.ok) return;
    
    // If not running, try to find the server on another port
    console.log('Server not responding, checking other ports...');
    const found = await findAndUpdateApiUrl();
    
    if (!found) {
      console.error('Server is not running. Please start the server manually with:');
      console.error('npm run server');
      alert('Server is not running. Please start the server manually with: npm run server');
    }
  } catch (err) {
    console.error('Error checking server status:', err);
  }
};

export const initializeStorage = async () => {
  await ensureServerRunning();
  try {
    const response = await fetch(`${getApiUrl()}/data/users`);
    if (!response.ok) throw new Error('Failed to initialize storage');
    return await response.json();
  } catch (error) {
    console.error('Error initializing storage:', error);
    return [];
  }
};

export const readFromStorage = async (key) => {
  try {
    const response = await fetch(`${getApiUrl()}/data/${key}`);
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
    
    const response = await fetch(`${getApiUrl()}/data/${key}`, {
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
