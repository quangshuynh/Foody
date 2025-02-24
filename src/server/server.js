const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const port = process.env.PORT || 3001;

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
  visited: [],
  toVisit: [],
  recommended: []
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
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Update specific data
app.put('/api/data/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const data = fs.readJsonSync(DATA_FILE);
    data[key] = value;
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
