import { getData, updateData, initializeStore } from './dataStore';

export const initializeStorage = () => {
  return initializeStore();
};

export const readFromStorage = (key) => {
  return getData(key);
};

export const writeToStorage = async (key, data) => {
  return updateData(key, data);
};
