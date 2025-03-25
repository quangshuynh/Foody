import { getAuthToken } from './authService';

let API_URL = 'http://localhost:3002/api';

// Update API URL if needed
export const updateApiUrl = (newUrl) => {
  API_URL = newUrl;
};

// Constants for localStorage keys
const STORAGE_KEYS = {
  TO_VISIT: 'foody_to_visit',
  RECOMMENDED: 'foody_recommended'
};

// Initialize storage with default values if empty
export const initializeJsonStorage = () => {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.TO_VISIT)) {
      localStorage.setItem(STORAGE_KEYS.TO_VISIT, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDED)) {
      localStorage.setItem(STORAGE_KEYS.RECOMMENDED, JSON.stringify([]));
    }
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

// Read data from localStorage
export const readJsonData = () => {
  try {
    return {
      toVisit: JSON.parse(localStorage.getItem(STORAGE_KEYS.TO_VISIT) || '[]'),
      recommended: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECOMMENDED) || '[]')
    };
  } catch (error) {
    console.error('Error reading data:', error);
    return {
      toVisit: [],
      recommended: []
    };
  }
};

// Write data to localStorage
export const writeJsonData = (data) => {
  try {
    if (data.toVisit !== undefined) {
      localStorage.setItem(STORAGE_KEYS.TO_VISIT, JSON.stringify(data.toVisit));
    }
    if (data.recommended !== undefined) {
      localStorage.setItem(STORAGE_KEYS.RECOMMENDED, JSON.stringify(data.recommended));
    }
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// Update specific key in localStorage
export const updateJsonData = (key, value) => {
  try {
    const storageKey = STORAGE_KEYS[key.toUpperCase()];
    if (!storageKey) throw new Error(`Invalid key: ${key}`);
    
    localStorage.setItem(storageKey, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error updating ${key} data:`, error);
    return false;
  }
};

// Export data to JSON file
export const exportToJsonFile = (filename = 'foody_data.json') => {
  try {
    const data = readJsonData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

// Import data from JSON file
export const importFromJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.toVisit || data.recommended) {
          writeJsonData(data);
          resolve(true);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
