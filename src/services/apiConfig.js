// Central configuration for API URL
let API_URL = 'http://localhost:3002/api';

// Update API URL across all services
export const updateApiUrl = (newUrl) => {
  API_URL = newUrl;
  
  // Dynamically import and update all services
  import('./authService.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update authService:', err));
  
  import('./restaurantService.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update restaurantService:', err));
  
  import('./toVisitService.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update toVisitService:', err));
  
  import('./recommendedService.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update recommendedService:', err));
  
  import('./dataStore.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update dataStore:', err));
  
  import('../utils/dbOperations.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update dbOperations:', err));
  
  import('./jsonStorage.js').then(module => {
    if (module.updateApiUrl) module.updateApiUrl(newUrl);
  }).catch(err => console.error('Failed to update jsonStorage:', err));
};

// Get the current API URL
export const getApiUrl = () => API_URL;

// Find the server and update API URL
export const findAndUpdateApiUrl = async () => {
  try {
    const { findServerPort } = await import('../utils/startServer.js');
    const port = await findServerPort();
    if (port) {
      const newUrl = `http://localhost:${port}/api`;
      updateApiUrl(newUrl);
      console.log(`Found server on port ${port}, updated API_URL to ${newUrl}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to find server:', err);
    return false;
  }
};
