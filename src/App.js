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
import './App.css'; // Import App.css for transition styles

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
  // Removed prevSection and slideDirection state
  const [displayLimit, setDisplayLimit] = useState(5);
  const [isPoopMode, setIsPoopMode] = useState(false);

  const sectionOrder = ['visited', 'toVisit', 'recommended'];

  // Refs for CSSTransition nodes
  const nodeRefs = useRef({});
  nodeRefs.current = sectionOrder.reduce((acc, key) => {
    acc[key] = acc[key] || React.createRef();
    return acc;
  }, nodeRefs.current);

  // Removed useEffect for slideDirection calculation

  // Fetch data on initial load and when auth state might change (though reads are now public)
  useEffect(() => {
    const loadData = async () => {
      // Fetch all lists regardless of login state
      try {
        const [visitedData, toVisitData, recommendedData] = await Promise.all([
          fetchVisitedRestaurants(),
          fetchToVisitRestaurants(),
          fetchRecommendedRestaurants() // Keep fetching recommended
        ]);
        setRestaurants(visitedData);
        setRestaurantsToVisit(toVisitData);
        setRecommendedRestaurants(recommendedData);
      } catch (err) {
        console.error('Failed to load restaurant data:', err);
        // Optionally show an error message to the user
      }

      // Note: We no longer clear lists on logout, as guests can see them.
      // The UI controls for editing/adding are handled by `isAuthenticated`.
    };

    // Only load data once auth state is determined (to avoid potential flashes)
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]); // Re-run only when auth loading state changes

  // Update filteredRestaurants whenever the main 'restaurants' list changes
  useEffect(() => {
    // No need to sort here if fetchVisitedRestaurants already sorts
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  // Add a new VISITED restaurant (uses restaurantService)
  const addRestaurant = async (restaurant) => {
    // Check authentication before allowing add
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
    // Check authentication before allowing update
    if (!isAuthenticated) {
      alert("Please log in to update a restaurant.");
      return;
    }
    try {
      // savedRestaurant contains the fields returned by the service (optimistic or actual)
      const savedRestaurant = await updateRestaurantApi(updatedRestaurant); 
      const updatedList = restaurants.map((rest) =>
        // If this is the restaurant that was updated...
        rest.id === savedRestaurant.id 
          // ...merge the existing data (rest) with the updated fields (savedRestaurant)
          ? { ...rest, ...savedRestaurant } 
          // ...otherwise, keep the original restaurant object
          : rest 
      );
      setRestaurants(updatedList);
    } catch (err) {
      console.error('Failed to update visited restaurant:', err);
      alert(`Failed to update visited restaurant: ${err.message}. Please try again.`);
    }
  };

  const removeRestaurant = async (id) => {
    // Check authentication before allowing remove
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

  // Add a restaurant to the TO VISIT list (uses toVisitService)
  const addToVisit = async (restaurant) => {
    // Check authentication before allowing add
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
    // Check authentication before allowing remove
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

  // Use user object directly for isAuthenticated check
  // user and authLoading are already available from the useAuth() call at the top of the component
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

  // Render loading indicator while checking auth state OR profile state after login
  if (authLoading || (user && profileLoading)) {
    return <AppContainer>Loading...</AppContainer>; // Show loading until profile is checked
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

        {/* Container for Transition Group */}
        <div style={{ position: 'relative' }}> {/* Removed minHeight and overflow: hidden */}
          <TransitionGroup component={null} /* Removed childFactory, relying on key */ >
            <CSSTransition
              key={selectedSection}
              nodeRef={nodeRefs.current[selectedSection]} // Pass the specific nodeRef
              timeout={500} // Match new CSS duration
              classNames="scale-fade" // Use consistent class name
              unmountOnExit // Optional: helps cleanup
            >
              {/* Attach the ref to the direct child of CSSTransition */}
              <div ref={nodeRefs.current[selectedSection]} className="section-container"> {/* Wrapper for positioning */}
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
                    {/* Separate container for the dropdown with fade effect */}
                    <div className={`dropdown-container ${selectedSection === 'visited' ? 'visible' : ''}`}>
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
                    </div> {/* End dropdown-container */}
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
                {/* Map is now inside the transitioning container */}
                <RestaurantMap restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]} />
              </div>
            </CSSTransition>
          </TransitionGroup>
                {/* Map is now inside the transitioning container */}
                <RestaurantMap restaurants={[...restaurants, ...restaurantsToVisit, ...recommendedRestaurants]} />
                {/* Footer is now inside the transitioning container */}
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
