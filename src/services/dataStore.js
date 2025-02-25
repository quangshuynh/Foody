let API_URL = 'http://localhost:3002/api';

// Update API URL if needed
export const updateApiUrl = (newUrl) => {
  API_URL = newUrl;
};

// Get data from API
export const getData = async (key) => {
  try {
    const response = await fetch(`${API_URL}/data/${key}`);
    if (!response.ok) throw new Error(`Failed to get ${key} data`);
    return await response.json();
  } catch (error) {
    console.error(`Error getting ${key} data:`, error);
    return [];
  }
};

// Update data via API
export const updateData = async (key, data) => {
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
    
    if (!response.ok) throw new Error(`Failed to update ${key} data`);
    return true;
  } catch (error) {
    console.error(`Error updating ${key} data:`, error);
    return false;
  }
};

// Get full store state
export const getFullStore = async () => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) throw new Error('Failed to get store data');
    return await response.json();
  } catch (error) {
    console.error('Error getting store data:', error);
    return {};
  }
};
