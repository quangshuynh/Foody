const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Check if server is already running
const checkServerRunning = (port) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/data`, () => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.abort();
      resolve(false);
    });
  });
};

// Start server if not running
const startServerIfNeeded = async () => {
  console.log('Checking if server is running...');
  
  // Try ports 3001-3010
  for (let port = 3001; port <= 3010; port++) {
    const isRunning = await checkServerRunning(port);
    if (isRunning) {
      console.log(`Server is already running on port ${port}`);
      return port;
    }
  }
  
  console.log('Starting server...');
  const serverPath = path.join(__dirname, '../server/server.js');
  const server = spawn('node', [serverPath], {
    detached: true,
    stdio: 'inherit'
  });
  
  // Don't wait for child process
  server.unref();
  
  // Give the server some time to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check which port it's running on
  for (let port = 3001; port <= 3010; port++) {
    const isRunning = await checkServerRunning(port);
    if (isRunning) {
      console.log(`Server started on port ${port}`);
      return port;
    }
  }
  
  console.log('Failed to start server');
  return null;
};

// Export for use in other files
module.exports = { startServerIfNeeded };

// If this script is run directly, start the server
if (require.main === module) {
  startServerIfNeeded().catch(console.error);
}
