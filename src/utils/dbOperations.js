// Default data structure
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

// Save data to localStorage with a timestamp
const saveData = (data) => {
  try {
    localStorage.setItem('dbData', JSON.stringify({
      timestamp: Date.now(),
      data
    }));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Load data from localStorage
const loadData = () => {
  try {
    const stored = localStorage.getItem('dbData');
    if (!stored) {
      saveData(defaultData);
      return defaultData;
    }
    return JSON.parse(stored).data;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export { loadData, saveData, defaultData };
