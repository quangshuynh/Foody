const API_URL = 'http://localhost:3001';

export const fetchVisitedRestaurants = async () => {
  const response = await fetch(`${API_URL}/visited`);
  if (!response.ok) throw new Error('Failed to fetch restaurants');
  return response.json();
};

export const updateRestaurant = async (restaurant) => {
  const response = await fetch(`${API_URL}/visited/${restaurant.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(restaurant)
  });
  if (!response.ok) throw new Error('Failed to update restaurant');
  return response.json();
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
