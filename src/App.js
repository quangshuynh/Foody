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

const Dropdown = styled.select`
  padding: 10px;
  font-size: 1rem;
  margin: 20px 0;
  border: 2px solid #00bcd4;
  border-radius: 8px;
  background-color: #262626;
  color: #f5f5f5;
`;

function App() {
  // visited restaurants list
  const [restaurants, setRestaurants] = useState(() => {
    const stored = localStorage.getItem('visitedRestaurants');
    return stored ? JSON.parse(stored) : [
      {
        id: 1,
        name: 'Dogtown',
        address: '691 Monroe Ave, Rochester, NY',
        location: { lat: 43.1438, lng: -77.5923 },
        rating: 4,
        goAgain: true,
        dateAdded: new Date(), 
      },
    ];
  });

  const [restaurantsToVisit, setRestaurantsToVisit] = useState(() => {
    const stored = localStorage.getItem('restaurantsToVisit');
    return stored ? JSON.parse(stored) : [];
  });

  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedSection, setSelectedSection] = useState('visited');

  useEffect(() => {
    localStorage.setItem('visitedRestaurants', JSON.stringify(restaurants));
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('restaurantsToVisit', JSON.stringify(restaurantsToVisit));
  }, [restaurantsToVisit]);

  useEffect(() => {
    setTimeout(() => {
      setRecommendedRestaurants([
        {
          id: 101,
          name: 'Kai poop',
          address: '2 Scottsville Rd, Rochester, NY',
          location: { lat: 43.1258, lng: -77.6424 },
          dateAdded: new Date()
        },
        {
          id: 102,
          name: 'Carlton Gibson Hall',
          address: 'Latimore Pl, Rochester, NY',
          location: { lat: 43.0857, lng: -77.6672 },
          dateAdded: new Date()
        },
      ]);
    }, 1000);
  }, []);

  const addRestaurant = (restaurant) => {
    const duplicate = restaurants.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      alert("This restaurant already exists in your visited list!");
      return;
    }
    const newRestaurant = { ...restaurant, id: Date.now(), dateAdded: new Date() };
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

  const removeRestaurant = (id) => {
    const updatedRestaurants = restaurants.filter((rest) => rest.id !== id);
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
    const duplicate = restaurantsToVisit.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      alert("This restaurant already exists in your 'to visit' list!");
      return;
    }
    const newRestaurant = { ...restaurant, id: Date.now(), dateAdded: new Date() };
    setRestaurantsToVisit([...restaurantsToVisit, newRestaurant]);
  };

  const removeToVisit = (id) => {
    const updatedToVisit = restaurantsToVisit.filter((r) => r.id !== id);
    setRestaurantsToVisit(updatedToVisit);
  };

  return (
    <AppContainer>
      <Header title="Foody" />
      <Dropdown value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
        <option value="visited">Visited Restaurants</option>
        <option value="toVisit">Restaurants to Visit</option>
        <option value="recommended">Recommended Restaurants</option>
      </Dropdown>
      {selectedSection === 'visited' && (
        <>
          <SearchBar searchRestaurants={searchRestaurants} />
          <h2>Visited Restaurants</h2>
          <RestaurantList
            restaurants={filteredRestaurants}
            updateRestaurant={updateRestaurant}
            addRestaurant={addRestaurant}
            removeRestaurant={removeRestaurant}
          />
        </>
      )}
      {selectedSection === 'toVisit' && (
        <>
          <h2>Restaurants to Visit</h2>
          <RestaurantsToVisit
            restaurantsToVisit={restaurantsToVisit}
            addToVisit={addToVisit}
            removeToVisit={removeToVisit}
          />
        </>
      )}
      {selectedSection === 'recommended' && (
        <>
          <h2>Recommended Restaurants</h2>
          <RecommendedRestaurants recommendedRestaurants={recommendedRestaurants} />
        </>
      )}
      <RestaurantMap
        restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]}
      />
      <Footer />
    </AppContainer>
  );
}

export default App;
