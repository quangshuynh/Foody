import { getData, updateData } from './dataStore';

export const initializeStorage = () => {
  return getData('users'); // This will trigger store initialization
};

export const readFromStorage = (key) => {
  return getData(key);
};

export const writeToStorage = async (key, data) => {
  return updateData(key, data);
};
