export const readFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (!data && key === 'users') {
      // Initialize with default admin user if no users exist
      const defaultUsers = [{
        id: "1",
        username: "admin",
        password: "admin123",
        role: "user",
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem(key, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from storage:`, error);
    return null;
  }
};

export const writeToStorage = async (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to storage:`, error);
    return false;
  }
};
