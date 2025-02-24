import { loadData, saveData } from '../utils/dbOperations';

// In-memory data store
let store = null;

// Initialize store with data
export const initializeStore = () => {
  if (!store) {
    store = loadData();
  }
  return store;
};

// Get data from store
export const getData = (key) => {
  if (!store) {
    store = loadData();
  }
  return store[key];
};

// Update data in store
export const updateData = (key, data) => {
  if (!store) {
    store = loadData();
  }
  store[key] = data;
  saveData(store);
  return true;
};

// Clear store
export const clearStore = () => {
  store = null;
  localStorage.removeItem('dbData');
};

// Get full store state
export const getFullStore = () => {
  if (!store) {
    store = loadData();
  }
  return store;
};
