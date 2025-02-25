import { getAuthToken } from './authService';

const API_URL = 'http://localhost:3002/api';

export const fetchVisitedRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants`);
    if (!response.ok) throw new Error('Failed to fetch restaurants');
    return await response.json();
  } catch (error) {
    console.error('Fetch restaurants error:', error);
    return [];
  }
};

export const updateRestaurant = async (restaurant) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/restaurants/${restaurant.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(restaurant)
    });

    if (!response.ok) throw new Error('Failed to update restaurant');
    return await response.json();
  } catch (error) {
    console.error('Update restaurant error:', error);
    throw error;
  }
};

export const addRestaurant = async (restaurant) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(restaurant)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add restaurant');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Add restaurant error:', error);
    throw error;
  }
};

export const deleteRestaurant = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token
      }
    });

    if (!response.ok) throw new Error('Failed to delete restaurant');
    return true;
  } catch (error) {
    console.error('Delete restaurant error:', error);
    throw error;
  }
};
