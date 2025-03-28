import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { fetchVisitedRestaurants, addRestaurant as addRestaurantApi, updateRestaurant as updateRestaurantApi, removeRestaurant as removeRestaurantApi } from './services/restaurantService';
import { fetchToVisitRestaurants, addToVisit as addToVisitApi, removeToVisit as removeToVisitApi, updateToVisit as updateToVisitApi } from './services/toVisitService';
import { fetchRecommendedRestaurants } from './services/recommendedService';
import { logout } from './services/authService';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa'; 
import SearchBar from './components/SearchBar';
import RestaurantList from './components/RestaurantList';
import RestaurantsToVisit from './components/RestaurantsToVisit';
import RecommendedRestaurants from './components/RecommendedRestaurants';
import RestaurantMap from './components/RestaurantMap';
import Footer from './components/Footer';
import ModalOverlay from './components/ModalOverlay';
import RestaurantFormModal from './components/RestaurantFormModal';
import Navbar from './components/Navbar';
import AddRestaurant from './components/AddRestaurant';
import './App.css';
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background: #1f1f1f;
  color: #f5f5f5;
  text-align: center;
  min-height: 90vh;
  padding: 6px;
  margin-top: 20px;
`;

// Styled button for opening the add modal
const AddButton = styled.button`
  background: #00bcd4;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.3s, transform 0.2s;

  &:hover {
    background: #00a1b5;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }


  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
`;


function App() {
  const { user, authLoading, profileLoading } = useAuth();

  const [restaurants, setRestaurants] = useState([]); 
  const [restaurantsToVisit, setRestaurantsToVisit] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);

  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedSection, setSelectedSection] = useState('visited');
  // State for Visited display limit
  const [visitedDisplayLimit, setVisitedDisplayLimit] = useState(5);
  const [isVisitedPoopMode, setIsVisitedPoopMode] = useState(false);
  // State for ToVisit display limit
  const [toVisitDisplayLimit, setToVisitDisplayLimit] = useState(5);
  const [isToVisitPoopMode, setIsToVisitPoopMode] = useState(false);

  // State for the Add/Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null); // null for add, restaurant object for edit
  const [formModalListType, setFormModalListType] = useState('visited'); // 'visited' or 'toVisit'


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

  // --- Visited Restaurant Handlers ---
  const addRestaurant = async (restaurant) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add a restaurant.");
      return Promise.reject(new Error("Authentication required")); // Return rejected promise for modal handling
    }
    const duplicate = restaurants.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      toast.warn("This restaurant already exists in your visited list!");
      return Promise.reject(new Error("Duplicate restaurant")); // Return rejected promise
    }
    try {
      const savedRestaurant = await addRestaurantApi(restaurant);
      setRestaurants(prev => [savedRestaurant, ...prev]);
    } catch (err) {
      console.error('Failed to add visited restaurant:', err);
      toast.error(`Failed to add visited restaurant: ${err.message}. Please try again.`); // Use toast.error
      throw err; // Re-throw error for modal handling
    }
  };

  const updateRestaurant = async (updatedRestaurant) => {
    if (!isAuthenticated) {
      toast.error("Please log in to update a restaurant.");
      return Promise.reject(new Error("Authentication required"));
    }
    try {
      const savedRestaurant = await updateRestaurantApi(updatedRestaurant); 
      const updatedList = restaurants.map((rest) =>
        rest.id === savedRestaurant.id ? { ...rest, ...savedRestaurant } : rest
      );
      setRestaurants(updatedList);
    } catch (err) {
      console.error('Failed to update visited restaurant:', err);
      toast.error(`Failed to update visited restaurant: ${err.message}. Please try again.`); // Use toast.error
      throw err; // Re-throw error for modal handling
    }
  };

  const removeRestaurant = async (id) => {
    if (!isAuthenticated) {
      toast.error("Please log in to remove a restaurant.");
      return; // No promise needed here as it's not called from modal submit
    }
    try {
      await removeRestaurantApi(id);
      const updatedList = restaurants.filter((rest) => rest.id !== id);
      setRestaurants(updatedList);
    } catch (err) {
      console.error('Failed to remove visited restaurant:', err);
      toast.error(`Failed to remove visited restaurant: ${err.message}. Please try again.`); // Use toast.error
    }
  };

  // --- Display Limit Handlers ---
  // Handler for Visited display limit
  const handleVisitedDisplayLimitChange = (e) => {
    const value = e.target.value;
    if (value === "poop") {
      setIsVisitedPoopMode(true);
      setVisitedDisplayLimit(5);
    } else {
      setIsVisitedPoopMode(false);
      setVisitedDisplayLimit(Number(value));
    }
  };

  // Handler for Visited display limit
  const handleVisitedDisplayLimitChange = (e) => {
    const value = e.target.value;
    if (value === "poop") {
      setIsVisitedPoopMode(true);
      setVisitedDisplayLimit(5);
    } else {
      setIsVisitedPoopMode(false);
      setVisitedDisplayLimit(Number(value));
    }
  };

  // Handler for ToVisit display limit
  const handleToVisitDisplayLimitChange = (e) => {
    const value = e.target.value;
    if (value === "poop") {
      setIsToVisitPoopMode(true);
      setToVisitDisplayLimit(5);
    } else {
      setIsToVisitPoopMode(false);
      setToVisitDisplayLimit(Number(value));
    }
  };

  // Handler for ToVisit display limit
  const handleToVisitDisplayLimitChange = (e) => {
    const value = e.target.value;
    if (value === "poop") {
      setIsToVisitPoopMode(true);
      setToVisitDisplayLimit(5);
    } else {
      setIsToVisitPoopMode(false);
      setToVisitDisplayLimit(Number(value));
    }
  };

  // --- To Visit Restaurant Handlers ---
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
      toast.error("Please log in to add a restaurant to visit.");
      return Promise.reject(new Error("Authentication required"));
    }
    const duplicate = restaurantsToVisit.some(
      (r) =>
        r.name.toLowerCase() === restaurant.name.toLowerCase() ||
        r.address.toLowerCase() === restaurant.address.toLowerCase()
    );
    if (duplicate) {
      toast.warn("This restaurant already exists in your 'to visit' list!");
      return Promise.reject(new Error("Duplicate restaurant"));
    }
    try {
      const savedToVisit = await addToVisitApi(restaurant);
      setRestaurantsToVisit(prev => [savedToVisit, ...prev]);
    } catch (err) {
      console.error('Failed to add to-visit restaurant:', err);
      toast.error(`Failed to add to-visit restaurant: ${err.message}. Please try again.`); // Use toast.error
      throw err; // Re-throw error for modal handling
    }
  };

  const removeToVisit = async (id) => {
    if (!isAuthenticated) {
      toast.error("Please log in to remove a restaurant from the 'to visit' list.");
      return; // Not called from modal submit
    }
    try {
      await removeToVisitApi(id);
      const updatedList = restaurantsToVisit.filter((r) => r.id !== id);
      setRestaurantsToVisit(updatedList);
    } catch (err) {
      console.error('Failed to remove to-visit restaurant:', err);
      toast.error(`Failed to remove to-visit restaurant: ${err.message}. Please try again.`); // Use toast.error
    }
  };

  // Handler for updating a 'to visit' restaurant
  const updateToVisit = async (updatedToVisit) => {
    if (!isAuthenticated) {
      toast.error("Please log in to update a restaurant.");
      return Promise.reject(new Error("Authentication required"));
    }
    try {
      const savedToVisit = await updateToVisitApi(updatedToVisit);
      const updatedList = restaurantsToVisit.map((rest) =>
        rest.id === savedToVisit.id ? { ...rest, ...savedToVisit } : rest
      );
      setRestaurantsToVisit(updatedList);
    } catch (err) {
      console.error('Failed to update to-visit restaurant:', err);
      toast.error(`Failed to update to-visit restaurant: ${err.message}. Please try again.`); // Use toast.error
      throw err; // Re-throw error for modal handling
    }
  };

  // --- Modal Handlers ---
  const openAddModal = (listType) => {
    setFormModalListType(listType);
    setEditingRestaurant(null); // Ensure we are in "add" mode
    setIsFormModalOpen(true);
  };

  const openEditModal = (restaurant, listType) => {
    setFormModalListType(listType);
    setEditingRestaurant(restaurant); // Set the restaurant to edit
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRestaurant(null); // Clear editing state when closing
  };
    }
  };

  // Handler for updating a 'to visit' restaurant
  const updateToVisit = async (updatedToVisit) => {
    if (!isAuthenticated) {
      alert("Please log in to update a restaurant.");
      return;
    }
    try {
      const savedToVisit = await updateToVisitApi(updatedToVisit);
      const updatedList = restaurantsToVisit.map((rest) =>
        rest.id === savedToVisit.id ? { ...rest, ...savedToVisit } : rest
      );
      setRestaurantsToVisit(updatedList);
    } catch (err) {
      console.error('Failed to update to-visit restaurant:', err);
      toast.error(`Failed to update to-visit restaurant: ${err.message}. Please try again.`); // Use toast.error
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
      toast.error(`Logout failed: ${error.message}`); // Use toast.error
    }
  };

  if (authLoading || (user && profileLoading)) {
    return <AppContainer>Loading...</AppContainer>;
  }

  return (
    <MapProvider>
      {/* Add ToastContainer here */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Use dark theme
      />
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

        {/* Add/Edit Restaurant Modal */}
        {isFormModalOpen && isAuthenticated && (
          <RestaurantFormModal
            restaurantToEdit={editingRestaurant}
            onSubmit={editingRestaurant ? (formModalListType === 'visited' ? updateRestaurant : updateToVisit) : (formModalListType === 'visited' ? addRestaurant : addToVisit)}
            onClose={closeFormModal}
            listType={formModalListType}
          />
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
                      <AddButton onClick={() => openAddModal('visited')} title="Add Visited Restaurant">
                        <FaPlus />
                      </AddButton>
                    )}
                    <RestaurantList
                      restaurants={filteredRestaurants.slice(0, visitedDisplayLimit)}
                      openEditModal={isAuthenticated ? (restaurant) => openEditModal(restaurant, 'visited') : null} // Pass function to open edit modal
                      // Use visitedDisplayLimit and isVisitedPoopMode
                      restaurants={filteredRestaurants.slice(0, visitedDisplayLimit)}
                      updateRestaurant={isAuthenticated ? updateRestaurant : null}
                      removeRestaurant={isAuthenticated ? removeRestaurant : null}
                      isPoopMode={isVisitedPoopMode}
                    />
                  </>
                )}

                {selectedSection === 'toVisit' && (
                  <>
                    <h2>Restaurants to Visit</h2>
                    {/* Replace AddToVisit component with a button */}
                    {isAuthenticated && (
                      <AddButton onClick={() => openAddModal('toVisit')} title="Add Restaurant To Visit">
                        <FaPlus />
                      </AddButton>
                    )}
                    <RestaurantsToVisit
                      restaurantsToVisit={restaurantsToVisit.slice(0, toVisitDisplayLimit)}
                      removeToVisit={isAuthenticated ? removeToVisit : null}
                      openEditModal={isAuthenticated ? (restaurant) => openEditModal(restaurant, 'toVisit') : null} // Pass function to open edit modal
                      // Use toVisitDisplayLimit
                      restaurantsToVisit={restaurantsToVisit.slice(0, toVisitDisplayLimit)}
                      addToVisit={isAuthenticated ? addToVisit : null}
                      removeToVisit={isAuthenticated ? removeToVisit : null}
                      // Pass updateToVisit handler
                      updateToVisit={isAuthenticated ? updateToVisit : null}
                      // Pass poop mode state
                      isPoopMode={isToVisitPoopMode}
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
                        id="visited-display-limit" // Unique ID
                        onChange={handleVisitedDisplayLimitChange} // Use specific handler
                        value={isVisitedPoopMode ? "poop" : visitedDisplayLimit} // Use specific state
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
                  {/* Add Display Limit Dropdown for To Visit */}
                  {selectedSection === 'toVisit' && (
                    <div
                      className={`dropdown-container ${selectedSection === 'toVisit' ? 'visible' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '50px', // Adjust as needed
                        gap: '12px',
                        marginLeft: '100px' // Adjust as needed
                      }}
                    >
                      <label
                        htmlFor="to-visit-display-limit"
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
                        id="to-visit-display-limit" // Unique ID
                        onChange={handleToVisitDisplayLimitChange} // Use specific handler
                        value={isToVisitPoopMode ? "poop" : toVisitDisplayLimit} // Use specific state
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
                        // Add hover/focus styles similar to the other dropdown
                        onMouseEnter={(e) => { e.target.style.borderColor = '#00e5ff'; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = '#00bcd4'; }}
                        onFocus={(e) => { e.target.style.borderColor = '#00e5ff'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#00bcd4'; }}
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

                  {/* Pass separate arrays to RestaurantMap */}
                  <RestaurantMap
                    visitedRestaurants={restaurants}
                    toVisitRestaurants={restaurantsToVisit}
                    recommendedRestaurants={recommendedRestaurants}
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
