import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

const defaultData = {
  users: [{
    id: "1",
    username: "admin",
    password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    role: "user",
    createdAt: new Date().toISOString()
  }],
  visited: [],
  toVisit: [],
  recommended: [
    {
      id: 101,
      name: 'Kai poop',
      address: '2 Scottsville Rd, Rochester, NY',
      location: { lat: 43.1258, lng: -77.6424 },
      dateAdded: new Date().toISOString()
    },
    {
      id: 102,
      name: 'Carlton Gibson Hall',
      address: 'Latimore Pl, Rochester, NY',
      location: { lat: 43.0857, lng: -77.6672 },
      dateAdded: new Date().toISOString()
    }
  ]
};

export const initializeJsonStorage = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
};

export const readJsonData = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return defaultData;
  }
};

export const writeJsonData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return false;
  }
};

export const updateJsonData = (key, value) => {
  const data = readJsonData();
  data[key] = value;
  return writeJsonData(data);
};
