import { readFromStorage, writeToStorage } from './fileService';

const STORAGE_KEY = 'visitedRestaurants';

export const fetchVisitedRestaurants = async () => {
  return readFromStorage(STORAGE_KEY) || [];
};

export const updateRestaurant = async (restaurant) => {
  try {
    const restaurants = await fetchVisitedRestaurants();
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index !== -1) {
      const updatedRestaurant = {
        ...restaurant,
        ratings: restaurant.ratings || [],
        averageRating: restaurant.averageRating || 0
      };
      restaurants[index] = updatedRestaurant;
      await writeToStorage(STORAGE_KEY, restaurants);
      return updatedRestaurant;
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
  await writeToStorage(STORAGE_KEY, restaurants);
  return newRestaurant;
};

export const deleteRestaurant = async (id) => {
  const restaurants = await fetchVisitedRestaurants();
  const filtered = restaurants.filter(r => r.id !== id);
  await writeToStorage(STORAGE_KEY, filtered);
  return true;
};
