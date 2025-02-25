import { getAuthToken } from './authService';

const API_URL = 'http://localhost:3002/api';

export const fetchRestaurantsToVisit = async () => {
  try {
    const response = await fetch(`${API_URL}/tovisit`);
    if (!response.ok) throw new Error('Failed to fetch to-visit restaurants');
    return await response.json();
  } catch (error) {
    console.error('Fetch to-visit restaurants error:', error);
    return [];
  }
};

export const addToVisitRestaurant = async (restaurant) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/tovisit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(restaurant)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add to-visit restaurant');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Add to-visit restaurant error:', error);
    throw error;
  }
};

export const deleteToVisitRestaurant = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/tovisit/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token
      }
    });

    if (!response.ok) throw new Error('Failed to delete to-visit restaurant');
    return true;
  } catch (error) {
    console.error('Delete to-visit restaurant error:', error);
    throw error;
  }
};
