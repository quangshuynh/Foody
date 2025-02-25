// Check if server is running
const checkServerRunning = (port) => {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    
    fetch(`http://localhost:${port}/api/data`, { 
      method: 'HEAD',
      signal: controller.signal 
    })
    .then(response => {
      clearTimeout(timeoutId);
      resolve(response.ok);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
};

// Find which port the server is running on
export const findServerPort = async () => {
  console.log('Checking for running server...');
  
  // Try ports 3001-3010
  for (let port = 3001; port <= 3010; port++) {
    const isRunning = await checkServerRunning(port);
    if (isRunning) {
      console.log(`Server is running on port ${port}`);
      return port;
    }
  }
  
  console.log('Server not found on any port');
  return null;
};

// Start server if not running - in browser we can only check, not start
export const startServerIfNeeded = async () => {
  const port = await findServerPort();
  
  if (!port) {
    console.error('Server is not running. Please start the server manually with:');
    console.error('npm run server');
    alert('Server is not running. Please start the server manually with: npm run server');
  }
  
  return port;
};
