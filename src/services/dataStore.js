import initialData from '../data/db.json';

// In-memory data store
let store = null;

// Initialize store with data
const initializeStore = () => {
  if (!store) {
    store = { ...initialData };
  }
  return store;
};

// Get data from store
export const getData = (key) => {
  if (!store) {
    initializeStore();
  }
  return store[key];
};

// Update data in store
export const updateData = (key, data) => {
  if (!store) {
    initializeStore();
  }
  store[key] = data;
  return true;
};

// Clear store
export const clearStore = () => {
  store = null;
};

// Get full store state
export const getFullStore = () => {
  if (!store) {
    initializeStore();
  }
  return store;
};
