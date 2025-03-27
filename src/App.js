import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { fetchVisitedRestaurants, addRestaurant as addRestaurantApi, updateRestaurant as updateRestaurantApi, removeRestaurant as removeRestaurantApi } from './services/restaurantService';
import { fetchToVisitRestaurants, addToVisit as addToVisitApi, removeToVisit as removeToVisitApi } from './services/toVisitService';
import { fetchRecommendedRestaurants } from './services/recommendedService';
import { logout } from './services/authService'; 
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
import './App.css'; 

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background: #1f1f1f;
  color: #f5f5f5;
  text-align: center;
  min-height: 90vh;
  padding: 6px;
  margin-top: 20px; 
`;

function App() {
  const { user, authLoading, profileLoading } = useAuth();

  const [restaurants, setRestaurants] = useState([]); 
  const [restaurantsToVisit, setRestaurantsToVisit] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);

  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedSection, setSelectedSection] = useState('visited');
  const [displayLimit, setDisplayLimit] = useState(5);
  const [isPoopMode, setIsPoopMode] = useState(false);

  const sectionOrder = ['visited', 'toVisit', 'recommended'];
  const nodeRefs = useRef({});
  nodeRefs.current = sectionOrder.reduce((acc, key) => {
    acc[key] = acc[key] || React.createRef();
    return acc;
  }, nodeRefs.current);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [visitedData, toVisitData, recommendedData] = await Promise.all([
          fetchVisitedRestaurants(),
          fetchToVisitRestaurants(),
          fetchRecommendedRestaurants()
        ]);
        setRestaurants(visitedData);
        setRestaurantsToVisit(toVisitData);
        setRecommendedRestaurants(recommendedData);
      } catch (err) {
        console.error('Failed to load restaurant data:', err);
      }
    };
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  useEffect(() => {
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  const addRestaurant = async (restaurant) => {
    if (!isAuthenticated) {
      alert("Please log in to add a restaurant.");
      return;
    }
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
      const savedRestaurant = await addRestaurantApi(restaurant);
      setRestaurants(prev => [savedRestaurant, ...prev]);
    } catch (err) {
      console.error('Failed to add visited restaurant:', err);
      alert(`Failed to add visited restaurant: ${err.message}. Please try again.`);
    }
  };

  const updateRestaurant = async (updatedRestaurant) => {
    if (!isAuthenticated) {
      alert("Please log in to update a restaurant.");
      return;
    }
    try {
      const savedRestaurant = await updateRestaurantApi(updatedRestaurant); 
      const updatedList = restaurants.map((rest) =>
        rest.id === savedRestaurant.id ? { ...rest, ...savedRestaurant } : rest
      );
      setRestaurants(updatedList);
    } catch (err) {
      console.error('Failed to update visited restaurant:', err);
      alert(`Failed to update visited restaurant: ${err.message}. Please try again.`);
    }
  };

  const removeRestaurant = async (id) => {
    if (!isAuthenticated) {
      alert("Please log in to remove a restaurant.");
      return;
    }
    try {
      await removeRestaurantApi(id);
      const updatedList = restaurants.filter((rest) => rest.id !== id);
      setRestaurants(updatedList);
    } catch (err) {
      console.error('Failed to remove visited restaurant:', err);
      alert(`Failed to remove visited restaurant: ${err.message}. Please try again.`);
    }
  };

  const handleDisplayLimitChange = (e) => {
    const value = e.target.value;
    if (value === "poop") {
      setIsPoopMode(true);
      setDisplayLimit(5);
    } else {
      setIsPoopMode(false);
      setDisplayLimit(Number(value));
    }
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

  const addToVisit = async (restaurant) => {
    if (!isAuthenticated) {
      alert("Please log in to add a restaurant to visit.");
      return;
    }
    const duplicate = restaurantsToVisit.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      alert("This restaurant already exists in your 'to visit' list!");
      return;
    }
    try {
      const savedToVisit = await addToVisitApi(restaurant);
      setRestaurantsToVisit(prev => [savedToVisit, ...prev]);
    } catch (err) {
      console.error('Failed to add to-visit restaurant:', err);
      alert(`Failed to add to-visit restaurant: ${err.message}. Please try again.`);
    }
  };

  const removeToVisit = async (id) => {
    if (!isAuthenticated) {
      alert("Please log in to remove a restaurant from the 'to visit' list.");
      return;
    }
    try {
      await removeToVisitApi(id);
      const updatedList = restaurantsToVisit.filter((r) => r.id !== id);
      setRestaurantsToVisit(updatedList);
    } catch (err) {
      console.error('Failed to remove to-visit restaurant:', err);
      alert(`Failed to remove to-visit restaurant: ${err.message}. Please try again.`);
    }
  };

  const isAuthenticated = !!user; 
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  if (authLoading || (user && profileLoading)) {
    return <AppContainer>Loading...</AppContainer>;
  }

  return (
    <MapProvider>
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

        <div style={{ position: 'relative' }}>
          <TransitionGroup component={null}>
            <CSSTransition
              key={selectedSection}
              nodeRef={nodeRefs.current[selectedSection]}
              timeout={500}
              classNames="scale-fade"
              unmountOnExit
            >
              <div ref={nodeRefs.current[selectedSection]} className="section-container">
                {selectedSection === 'visited' && (
                  <>
                    <h2>Visited Restaurants</h2>
                    <div style={{ width: '80%', margin: '0 auto' }}>
                      <SearchBar searchRestaurants={searchRestaurants} />
                    </div>
                    {isAuthenticated && (
                      <AddRestaurant addRestaurant={addRestaurant} />
                    )}
                    <RestaurantList
                      restaurants={filteredRestaurants.slice(0, displayLimit)}
                      updateRestaurant={isAuthenticated ? updateRestaurant : null}
                      removeRestaurant={isAuthenticated ? removeRestaurant : null}
                      isPoopMode={isPoopMode}
                    />
                  </>
                )}

                {selectedSection === 'toVisit' && (
                  <>
                    <h2>Restaurants to Visit</h2>
                    <RestaurantsToVisit
                      restaurantsToVisit={restaurantsToVisit}
                      addToVisit={isAuthenticated ? addToVisit : null}
                      removeToVisit={isAuthenticated ? removeToVisit : null}
                    />
                  </>
                )}

                {selectedSection === 'recommended' && (
                  <>
                    <h2>Recommended Restaurants</h2>
                    <RecommendedRestaurants recommendedRestaurants={recommendedRestaurants} />
                  </>
                )}

                <div style={{ width: '80%', margin: '0 auto', textAlign: 'left' }}>
                  {selectedSection === 'visited' && (
                    <div
                      className={`dropdown-container ${selectedSection === 'visited' ? 'visible' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '50px',
                        gap: '12px',
                        marginLeft: '100px'
                      }}
                    >
                      <label
                        htmlFor="display-limit"
                        style={{
                          fontWeight: '500',
                          fontSize: '1rem',
                          color: '#ccc',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Display Limit:
                      </label>

                      <select
                        id="display-limit"
                        onChange={handleDisplayLimitChange}
                        value={isPoopMode ? "poop" : displayLimit}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          background: '#2a2a2a',
                          color: '#f5f5f5',
                          border: '1px solid #00bcd4',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          transition: 'background 0.3s, border-color 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#00e5ff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#00bcd4';
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#00e5ff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#00bcd4';
                        }}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="poop">💩</option>
                      </select>
                    </div>
                  )}

                  <RestaurantMap
                    restaurants={[
                      ...restaurants,
                      ...restaurantsToVisit,
                      ...recommendedRestaurants
                    ]}
                  />
                </div>

                <Footer />
              </div>
            </CSSTransition>
          </TransitionGroup>
        </div>
      </AppContainer>
    </MapProvider>
  );
}

export default App;
