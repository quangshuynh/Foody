import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RestaurantList from './components/RestaurantList';
import RestaurantsToVisit from './components/RestaurantsToVisit';
import RecommendedRestaurants from './components/RecommendedRestaurants';
import RestaurantMap from './components/RestaurantMap';
import Footer from './components/Footer';

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background: #1f1f1f;
  color: #f5f5f5;
  text-align: center;
  min-height: 100vh;
  padding: 20px;
`;

function App() {
  // visited restaurants list
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: 'Dogtown',
      address: '691 Monroe Ave, Rochester, NY',
      location: { lat: 43.1438, lng: -77.5923 },
      rating: 4,
      goAgain: true,
    },
  ]);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  // restaurants to visit list (wishlist)
  const [restaurantsToVisit, setRestaurantsToVisit] = useState([]);

  // Recommended restaurants – simulated fetch (in production, replace with real API/scraping)
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setRecommendedRestaurants([
        {
          id: 101,
          name: 'Kai poop',
          address: '2 Scottsville Rd, Rochester, NY',
          location: { lat: 43.1258, lng: -77.6424 },
        },
        {
          id: 102,
          name: 'Carlton Gibson Hall',
          address: 'Latimore Pl, Rochester, NY',
          location: { lat: 43.0857, lng: -77.6672 },
        },
      ]);
    }, 1000);
  }, []);

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

  const addToVisit = (restaurant) => {
    const newRestaurant = { ...restaurant, id: Date.now() };
    setRestaurantsToVisit([...restaurantsToVisit, newRestaurant]);
  };

  return (
    <AppContainer>
      <Header title="Foody" />
      <SearchBar searchRestaurants={searchRestaurants} />
      <h2>Visited Restaurants</h2>
      <RestaurantList
        restaurants={filteredRestaurants}
        updateRestaurant={updateRestaurant}
        addRestaurant={addRestaurant}
      />
      <h2>Restaurants to Visit</h2>
      <RestaurantsToVisit
        restaurantsToVisit={restaurantsToVisit}
        addToVisit={addToVisit}
      />
      <h2>Recommended Restaurants (change to real API/scraping later)</h2>
      <RecommendedRestaurants recommendedRestaurants={recommendedRestaurants} />
      <RestaurantMap
        restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]}
      />
      <Footer />
    </AppContainer>
  );
}

export default App;
