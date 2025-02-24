const API_URL = 'http://localhost:3001';

export const fetchVisitedRestaurants = async () => {
  const response = await fetch(`${API_URL}/visited`);
  if (!response.ok) throw new Error('Failed to fetch restaurants');
  return response.json();
};

export const updateRestaurant = async (restaurant) => {
  try {
    const response = await fetch(`${API_URL}/visited/${restaurant.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(restaurant)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update restaurant');
    }
    
    return response.json();
  } catch (error) {
    console.error('Update restaurant error:', error);
    throw error;
  }
};

export const addRestaurant = async (restaurant) => {
  const response = await fetch(`${API_URL}/visited`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(restaurant)
  });
  if (!response.ok) throw new Error('Failed to add restaurant');
  return response.json();
};

export const deleteRestaurant = async (id) => {
  const response = await fetch(`${API_URL}/visited/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete restaurant');
  return true;
};
