const API_URL = 'http://localhost:3002/api';

export const fetchRecommendedRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/recommended`);
    if (!response.ok) throw new Error('Failed to fetch recommended restaurants');
    return await response.json();
  } catch (error) {
    console.error('Fetch recommended restaurants error:', error);
    return [];
  }
};
