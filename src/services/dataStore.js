// In-memory data store
let store = null;

// Default initial data
const defaultData = {
  users: [{
    id: "1",
    username: "admin",
    password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
    role: "user",
    createdAt: new Date().toISOString()
  }],
  visited: [],
  toVisit: []
};

// Initialize store with data
export const initializeStore = () => {
  if (!store) {
    store = { ...defaultData };
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
