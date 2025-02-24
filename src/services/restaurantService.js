import { readJSONFile, writeJSONFile } from './fileService';

const STORAGE_KEY = 'visitedRestaurants';

export const fetchVisitedRestaurants = async () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateRestaurant = async (restaurant) => {
  try {
    const restaurants = await fetchVisitedRestaurants();
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index !== -1) {
      restaurants[index] = restaurant;
      await writeJSONFile(STORAGE_KEY, restaurants);
      return restaurant;
    }
    throw new Error('Restaurant not found');
  } catch (error) {
    console.error('Update restaurant error:', error);
    throw error;
  }
};

export const addRestaurant = async (restaurant) => {
  const restaurants = await fetchVisitedRestaurants();
  const newRestaurant = {
    ...restaurant,
    id: Date.now().toString(),
    ratings: [],
    averageRating: 0
  };
  restaurants.push(newRestaurant);
  await writeJSONFile(STORAGE_KEY, restaurants);
  return newRestaurant;
};

export const deleteRestaurant = async (id) => {
  const restaurants = await fetchVisitedRestaurants();
  const filtered = restaurants.filter(r => r.id !== id);
  await writeJSONFile(STORAGE_KEY, filtered);
  return true;
};
