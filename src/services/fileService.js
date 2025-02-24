import initialData from '../data/db.json';

let localData = null;

export const initializeStorage = () => {
  if (!localData) {
    try {
      const savedData = localStorage.getItem('appData');
      if (savedData) {
        localData = JSON.parse(savedData);
      } else {
        localData = { ...initialData };
        localStorage.setItem('appData', JSON.stringify(localData));
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      localData = { ...initialData };
    }
  }
  return localData;
};

export const readFromStorage = (key) => {
  if (!localData) {
    initializeStorage();
  }
  return localData[key] || null;
};

export const writeToStorage = async (key, data) => {
  try {
    if (!localData) {
      initializeStorage();
    }
    localData[key] = data;
    localStorage.setItem('appData', JSON.stringify(localData));
    return true;
  } catch (error) {
    console.error(`Error writing to storage:`, error);
    return false;
  }
};

export const clearStorage = () => {
  localStorage.removeItem('appData');
  localData = null;
};
