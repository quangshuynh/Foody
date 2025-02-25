const API_URL = 'http://localhost:3001/api';
import { getAuthToken } from './authService';

export const initializeJsonStorage = async () => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) throw new Error('Failed to initialize storage');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

export const readJsonData = async () => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) throw new Error('Failed to read data');
    return await response.json();
  } catch (error) {
    console.error('Error reading data:', error);
    return {
      toVisit: [],
      recommended: []
    };
  }
};

export const writeJsonData = async (data) => {
  try {
    const token = getAuthToken();
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
      
      if (!response.ok) throw new Error(`Failed to write ${key} data`);
    }
    
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

export const updateJsonData = async (key, value) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/data/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ value })
    });
    
    if (!response.ok) throw new Error(`Failed to update ${key} data`);
    return true;
  } catch (error) {
    console.error(`Error updating ${key} data:`, error);
    return false;
  }
};
