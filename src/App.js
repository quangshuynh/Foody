import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { fetchVisitedRestaurants, addRestaurant as addRestaurantApi } from './services/restaurantService';
import { initializeJsonStorage, readJsonData, updateJsonData } from './services/jsonStorage';
import styled from 'styled-components';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RestaurantList from './components/RestaurantList';
import RestaurantsToVisit from './components/RestaurantsToVisit';
import RecommendedRestaurants from './components/RecommendedRestaurants';
import RestaurantMap from './components/RestaurantMap';
import Footer from './components/Footer';

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  &:hover {
    background: #00a1b5;
  }
`;

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

const AuthButtonContainer = styled.div`
  position: absolute;
  top: 27px;
  right: 27px;
  display: flex;
  gap: 10px;
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

  const { isAuthenticated, isGuest, setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AppContainer>
      <AuthButtonContainer>
        {isGuest ? (
          <div style={{ marginBottom: '20px' }}>
            <Button onClick={() => {
              setShowLogin(!showLogin);
              setShowRegister(false);
            }}>
              {showLogin ? 'Hide Login' : 'Login'}
            </Button>
            <Button onClick={() => {
              setShowRegister(!showRegister);
              setShowLogin(false);
            }} style={{ marginLeft: '10px' }}>
              {showRegister ? 'Hide Register' : 'Register'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogout} style={{ marginBottom: '20px' }}>
            Logout
          </Button>
        )}
        </AuthButtonContainer>
        {showLogin && <LoginForm onSuccess={() => setShowLogin(false)} />}
        {showRegister && <RegisterForm onSuccess={() => setShowRegister(false)} />}
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
          {isAuthenticated ? (
            <RestaurantList
              restaurants={filteredRestaurants}
              updateRestaurant={updateRestaurant}
              addRestaurant={addRestaurant}
              removeRestaurant={removeRestaurant}
            />
          ) : (
            <RestaurantList
              restaurants={filteredRestaurants}
              updateRestaurant={null}
              addRestaurant={null}
              removeRestaurant={null}
            />
          )}
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
