import React, { useState, useEffect } from 'react'; // Ensure React is imported only once
import { useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
// Updated imports for Firestore services
import { fetchVisitedRestaurants, addRestaurant as addRestaurantApi, updateRestaurant as updateRestaurantApi, removeRestaurant as removeRestaurantApi } from './services/restaurantService';
import { fetchToVisitRestaurants, addToVisit as addToVisitApi, removeToVisit as removeToVisitApi } from './services/toVisitService';
import { fetchRecommendedRestaurants } from './services/recommendedService';
// Removed jsonStorage imports
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
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  // State for different restaurant lists
  const [restaurants, setRestaurants] = useState([]); // Visited
  const [restaurantsToVisit, setRestaurantsToVisit] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);

  // State for UI
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedSection, setSelectedSection] = useState('visited');
  const [displayLimit, setDisplayLimit] = useState(5);
  const [isPoopMode, setIsPoopMode] = useState(false);

  // Fetch data based on user authentication state
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // User is logged in, fetch their visited and to-visit lists
        try {
          const [visitedData, toVisitData] = await Promise.all([
            fetchVisitedRestaurants(),
            fetchToVisitRestaurants()
          ]);
          setRestaurants(visitedData);
          setRestaurantsToVisit(toVisitData);
        } catch (err) {
          console.error('Failed to load user-specific data:', err);
          // Optionally show an error message to the user
        }
      } else {
        // User is logged out, clear user-specific lists
        setRestaurants([]);
        setRestaurantsToVisit([]);
      }

      // Fetch recommended restaurants (public data) regardless of login state
      try {
        const recommendedData = await fetchRecommendedRestaurants();
        setRecommendedRestaurants(recommendedData);
      } catch (err) {
        console.error('Failed to load recommended restaurants:', err);
      }
    };

    // Only load data once auth state is determined
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]); // Re-run when user or authLoading changes

  // Update filteredRestaurants whenever the main 'restaurants' list changes
  useEffect(() => {
    // No need to sort here if fetchVisitedRestaurants already sorts
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  // Add a new VISITED restaurant (uses restaurantService)
  const addRestaurant = async (restaurant) => {
    const duplicate = restaurants.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      alert("This restaurant already exists in your visited list!");
      alert("This restaurant already exists in your visited list!");
      return;
    }
    try {
      // No need to add dateAdded here, Firestore service handles it
      const savedRestaurant = await addRestaurantApi(restaurant);
      // Prepend the new restaurant to the list for immediate UI update
      setRestaurants(prev => [savedRestaurant, ...prev]);
    } catch (err) {
      console.error('Failed to add visited restaurant:', err);
      alert(`Failed to add visited restaurant: ${err.message}. Please try again.`);
    }
  };

  // Update a VISITED restaurant (uses restaurantService)
  const updateRestaurant = async (updatedRestaurant) => {
    try {
      const savedRestaurant = await updateRestaurantApi(updatedRestaurant);
      const updatedList = restaurants.map((rest) =>
        rest.id === savedRestaurant.id ? savedRestaurant : rest
      );
      setRestaurants(updatedList);
      // No need to update filteredRestaurants separately if it depends on restaurants state
    } catch (err) {
      console.error('Failed to update visited restaurant:', err);
      alert(`Failed to update visited restaurant: ${err.message}. Please try again.`);
    }
  };

  const removeRestaurant = async (id) => {
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

  // Add a restaurant to the TO VISIT list (uses toVisitService)
  const addToVisit = async (restaurant) => {
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
      // Pass the basic restaurant info (name, address, location)
      const savedToVisit = await addToVisitApi(restaurant);
      // Prepend to the list for immediate UI update
      setRestaurantsToVisit(prev => [savedToVisit, ...prev]);
    } catch (err) {
      console.error('Failed to add to-visit restaurant:', err);
      alert(`Failed to add to-visit restaurant: ${err.message}. Please try again.`);
    }
  };

  // Remove a restaurant from the TO VISIT list (uses toVisitService)
  const removeToVisit = async (id) => {
    try {
      await removeToVisitApi(id);
      const updatedList = restaurantsToVisit.filter((r) => r.id !== id);
      setRestaurantsToVisit(updatedList);
    } catch (err) {
      console.error('Failed to remove to-visit restaurant:', err);
      alert(`Failed to remove to-visit restaurant: ${err.message}. Please try again.`);
    }
  };

  // Use user object directly for isAuthenticated check
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user; // Derive from user object
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // The logout function is imported at the top level, remove the misplaced import below

  const handleLogout = async () => {
    try {
      await logout();
      // No need to manually set user to null or remove items from localStorage.
      // The onAuthStateChanged listener in AuthContext handles the state update.
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  // Render loading indicator while checking auth state
  if (authLoading) {
    return <AppContainer>Loading...</AppContainer>; // Or a proper spinner component
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
              // Pass the async updateRestaurant function directly
              updateRestaurant={isAuthenticated ? updateRestaurant : null}
              removeRestaurant={isAuthenticated ? removeRestaurant : null}
              isPoopMode={isPoopMode}
            />

            <div style={{ width: '80%', margin: '10px auto', textAlign: 'left' }}>
              <select 
                onChange={handleDisplayLimitChange} 
                value={isPoopMode ? "poop" : displayLimit}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  background: '#2a2a2a',
                  color: '#f5f5f5',
                  border: '1px solid #00bcd4',
                  cursor: 'pointer'
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
        <RestaurantMap restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]} />
        <Footer />
      </AppContainer>
    </MapProvider>
  );
}

export default App;
