const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const http = require('http');

const app = express();
let port = process.env.PORT || 3001;

// Data file path
const DATA_FILE = path.join(__dirname, '../../data/appData.json');

// Default data structure
const defaultData = {
  users: [{
    id: "1",
    username: "admin",
    password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
    role: "user",
    createdAt: new Date().toISOString()
  }],
  visitedRestaurants: [],
  toVisit: [],
  recommended: [
    {
      id: "101",
      name: 'Kai poop',
      address: '2 Scottsville Rd, Rochester, NY',
      location: { lat: 43.1258, lng: -77.6424 },
      dateAdded: new Date().toISOString()
    },
    {
      id: "102",
      name: 'Carlton Gibson Hall',
      address: 'Latimore Pl, Rochester, NY',
      location: { lat: 43.0857, lng: -77.6672 },
      dateAdded: new Date().toISOString()
    }
  ]
};

// Ensure data directory and file exist
const initializeData = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeJsonSync(DATA_FILE, defaultData, { spaces: 2 });
  }
};

// Initialize data storage
initializeData();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from localhost on any port
  if (origin && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Hash password function
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // In a real app, you would validate the token properly
  // For this demo, we'll just check if it starts with "dummy-token-"
  if (!token.startsWith('dummy-token-')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
};

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    // Don't send passwords to client
    const safeData = { ...data };
    if (safeData.users) {
      safeData.users = safeData.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }
    res.json(safeData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Get specific data
app.get('/api/data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const data = fs.readJsonSync(DATA_FILE);
    
    if (key === 'users') {
      // Don't send passwords to client
      const safeUsers = data.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } else {
      res.json(data[key] || []);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Update specific data
app.put('/api/data/:key', authenticateUser, (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // Read existing data
    let data = {};
    if (fs.existsSync(DATA_FILE)) {
      data = fs.readJsonSync(DATA_FILE);
    } else {
      data = defaultData;
    }
    
    // Update data
    data[key] = value;
    
    // Write back to file
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Register new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Read existing data
    const data = fs.readJsonSync(DATA_FILE);
    
    // Check if username already exists
    if (data.users.some(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashPassword(password),
      role: "user",
      createdAt: new Date().toISOString()
    };
    
    // Add user to data
    data.users.push(newUser);
    
    // Write back to file
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    
    // Return user without password and with token
    const { password: _, ...userWithoutPassword } = newUser;
    const token = 'dummy-token-' + Date.now();
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Read existing data
    const data = fs.readJsonSync(DATA_FILE);
    
    // Find user
    const user = data.users.find(u => u.username === username);
    
    // Check if user exists and password is correct
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user without password and with token
    const { password: _, ...userWithoutPassword } = user;
    const token = 'dummy-token-' + Date.now();
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Restaurant endpoints
app.get('/api/restaurants', (req, res) => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    res.json(data.visitedRestaurants || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

app.post('/api/restaurants', authenticateUser, (req, res) => {
  try {
    const restaurant = req.body;
    const data = fs.readJsonSync(DATA_FILE);
    
    // Check for duplicates
    const duplicate = data.visitedRestaurants.some(
      r => r.name.toLowerCase() === restaurant.name.toLowerCase() ||
           r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    
    if (duplicate) {
      return res.status(400).json({ error: 'Restaurant already exists' });
    }
    
    const newRestaurant = {
      ...restaurant,
      id: Date.now().toString(),
      ratings: [],
      averageRating: 0
    };
    
    data.visitedRestaurants.push(newRestaurant);
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    
    res.json(newRestaurant);
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ error: 'Failed to add restaurant' });
  }
});

app.put('/api/restaurants/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;
    const updatedRestaurant = req.body;
    const data = fs.readJsonSync(DATA_FILE);
    
    const index = data.visitedRestaurants.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    data.visitedRestaurants[index] = {
      ...updatedRestaurant,
      id,
      ratings: updatedRestaurant.ratings || data.visitedRestaurants[index].ratings || [],
      averageRating: updatedRestaurant.averageRating || data.visitedRestaurants[index].averageRating || 0
    };
    
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    res.json(data.visitedRestaurants[index]);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

app.delete('/api/restaurants/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;
    const data = fs.readJsonSync(DATA_FILE);
    
    data.visitedRestaurants = data.visitedRestaurants.filter(r => r.id !== id);
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

// To-visit restaurants endpoints
app.get('/api/tovisit', (req, res) => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    res.json(data.toVisit || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch to-visit restaurants' });
  }
});

app.post('/api/tovisit', authenticateUser, (req, res) => {
  try {
    const restaurant = req.body;
    const data = fs.readJsonSync(DATA_FILE);
    
    // Check for duplicates
    const duplicate = data.toVisit.some(
      r => r.name.toLowerCase() === restaurant.name.toLowerCase() ||
           r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    
    if (duplicate) {
      return res.status(400).json({ error: 'Restaurant already exists in to-visit list' });
    }
    
    const newRestaurant = {
      ...restaurant,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    };
    
    data.toVisit.push(newRestaurant);
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    
    res.json(newRestaurant);
  } catch (error) {
    console.error('Error adding to-visit restaurant:', error);
    res.status(500).json({ error: 'Failed to add to-visit restaurant' });
  }
});

app.delete('/api/tovisit/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;
    const data = fs.readJsonSync(DATA_FILE);
    
    data.toVisit = data.toVisit.filter(r => r.id !== id);
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting to-visit restaurant:', error);
    res.status(500).json({ error: 'Failed to delete to-visit restaurant' });
  }
});

// Recommended restaurants endpoints
app.get('/api/recommended', (req, res) => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    res.json(data.recommended || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommended restaurants' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Function to find an available port
const startServer = (initialPort) => {
  port = initialPort;
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying ${port + 1}...`);
      port += 1;
      setTimeout(() => {
        server.close();
        server.listen(port);
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });
  
  server.on('listening', () => {
    console.log(`Server running on port ${port}`);
    
    // Update API_URL in client files if port changed
    if (port !== 3001) {
      updateClientApiUrl(port);
    }
  });
  
  server.listen(port);
};

// Function to update API_URL in client files if port changed
const updateClientApiUrl = (newPort) => {
  const clientFiles = [
    path.join(__dirname, '../services/fileService.js'),
    path.join(__dirname, '../services/authService.js'),
    path.join(__dirname, '../services/restaurantService.js'),
    path.join(__dirname, '../services/jsonStorage.js'),
    path.join(__dirname, '../services/toVisitService.js'),
    path.join(__dirname, '../services/recommendedService.js'),
    path.join(__dirname, '../utils/dbOperations.js')
  ];
  
  clientFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(
          /const API_URL = ['"]http:\/\/localhost:3001\/api['"]/g,
          `const API_URL = 'http://localhost:${newPort}/api'`
        );
        fs.writeFileSync(filePath, content, 'utf8');
      } catch (error) {
        console.error(`Error updating API_URL in ${filePath}:`, error);
      }
    }
  });
};

// Start the server
startServer(port);
