import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { fetchVisitedRestaurants, addRestaurant as addRestaurantApi } from './services/restaurantService';
import { initializeJsonStorage, readJsonData, updateJsonData } from './services/jsonStorage';
import styled from 'styled-components';
import SearchBar from './components/SearchBar';
import RestaurantList from './components/RestaurantList';
import RestaurantsToVisit from './components/RestaurantsToVisit';
import RecommendedRestaurants from './components/RecommendedRestaurants';
import RestaurantMap from './components/RestaurantMap';
import Footer from './components/Footer';
import ModalOverlay from './components/ModalOverlay';
import Navbar from './components/Navbar';
import AddRestaurant from './components/AddRestaurant';

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background: #1f1f1f;
  color: #f5f5f5;
  text-align: center;
  min-height: 100vh;
  padding: 20px;
  margin-top: 65px; 
`;

function App() {
  // visited restaurants list
  const [restaurants, setRestaurants] = useState([]);
  useEffect(() => {
    initializeJsonStorage().catch(console.error);
    const loadRestaurants = async () => {
      try {
        const data = await fetchVisitedRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      }
    };
    loadRestaurants();
  }, []);

  const [restaurantsToVisit, setRestaurantsToVisit] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedSection, setSelectedSection] = useState('visited');

  useEffect(() => {
    const sortedRestaurants = [...restaurants].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    setFilteredRestaurants(sortedRestaurants);
  }, [restaurants]);
  

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const data = await readJsonData();
        setRestaurantsToVisit(data.toVisit || []);
        setRecommendedRestaurants(data.recommended || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    updateJsonData('toVisit', restaurantsToVisit);
  }, [restaurantsToVisit]);

  const addRestaurant = async (restaurant) => {
    const duplicate = restaurants.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      alert("This restaurant already exists in your visited list!");
      return;
    }
    try {
      const newRestaurant = { ...restaurant, dateAdded: new Date().toISOString() };
      const savedRestaurant = await addRestaurantApi(newRestaurant);
      setRestaurants(prev => [...prev, savedRestaurant]);
    } catch (err) {
      console.error('Failed to add restaurant:', err);
      alert('Failed to add restaurant. Please try again.');
    }
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

  const { isAuthenticated, setUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <>
      <Navbar
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        onShowLogin={() => {
          setShowLogin(true);
          setShowRegister(false);
        }}
        onShowRegister={() => {
          setShowRegister(true);
          setShowLogin(false);
        }}
        onLogout={handleLogout}
      />

      <AppContainer>
        {showLogin && (
          <ModalOverlay onClick={() => setShowLogin(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <LoginForm onSuccess={() => setShowLogin(false)} />
            </div>
          </ModalOverlay>
        )}
        {showRegister && (
          <ModalOverlay onClick={() => setShowRegister(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <RegisterForm onSuccess={() => setShowRegister(false)} />
            </div>
          </ModalOverlay>
        )}


        {selectedSection === 'visited' && (
          <>
            <h2>Visited Restaurants</h2>
            <SearchBar searchRestaurants={searchRestaurants} />
            {isAuthenticated && (
              <AddRestaurant addRestaurant={addRestaurant} />
            )}
            <RestaurantList
              restaurants={filteredRestaurants}
              updateRestaurant={isAuthenticated ? updateRestaurant : null}
              addRestaurant={null} 
              removeRestaurant={isAuthenticated ? removeRestaurant : null}
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
        <RestaurantMap restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]} />
        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
