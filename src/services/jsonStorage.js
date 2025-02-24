const DB_NAME = 'foodyDB';
const STORE_NAME = 'appData';

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

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const initializeJsonStorage = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  const request = store.get('appData');
  
  const existingData = await new Promise((resolve) => {
    const request = store.get('appData');
    request.onsuccess = () => resolve(request.result);
  });

  if (!existingData) {
    store.put(defaultData, 'appData');
  }
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const readJsonData = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get('appData');
      request.onsuccess = () => resolve(request.result || defaultData);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading data:', error);
    return defaultData;
  }
};

export const writeJsonData = async (data) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data, 'appData');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

export const updateJsonData = async (key, value) => {
  try {
    const data = await readJsonData();
    data[key] = value;
    return await writeJsonData(data);
  } catch (error) {
    console.error('Error updating data:', error);
    return false;
  }
};
