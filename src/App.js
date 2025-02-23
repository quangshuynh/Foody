import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import RestaurantMap from './components/RestaurantMap';
import SearchBar from './components/SearchBar';

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background: #1f1f1f;
  color: #f5f5f5;
  text-align: center;
  min-height: 100vh;
  padding: 20px;
`;

function App() {
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: 'The Food Hub',
      address: '123 Main St, Rochester, NY',
      location: { lat: 43.1566, lng: -77.6088 },
      rating: 4,
      goAgain: true,
    },
  ]);

  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  const addRestaurant = (restaurant) => {
    const newRestaurant = { ...restaurant, id: Date.now() };
    const updatedRestaurants = [...restaurants, newRestaurant];
    setRestaurants(updatedRestaurants);
    setFilteredRestaurants(updatedRestaurants);
  };

  const updateRestaurant = (updatedRestaurant) => {
    const updatedRestaurants = restaurants.map((rest) =>
      rest.id === updatedRestaurant.id ? updatedRestaurant : rest
    );
    setRestaurants(updatedRestaurants);
    setFilteredRestaurants(updatedRestaurants);
  };

  const searchRestaurants = (query) => {
    if (query.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  };

  return (
    <AppContainer>
      <Header title="Foody" />
      <SearchBar searchRestaurants={searchRestaurants} />
      <RestaurantList
        restaurants={filteredRestaurants}
        updateRestaurant={updateRestaurant}
        addRestaurant={addRestaurant}
      />
      <RestaurantMap restaurants={filteredRestaurants} />
    </AppContainer>
  );
}

export default App;
