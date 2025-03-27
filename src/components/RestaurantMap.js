import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, useMap as useLeafletMap } from 'react-leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import '../styles/MapDarkMode.css';
import L from 'leaflet';
import { useMap } from '../contexts/MapContext';
import RestaurantMarker from './RestaurantMarker';
import { toast } from 'react-toastify'; // Import toast
import { FiCopy } from 'react-icons/fi'; // Import FiCopy

// Helper function to scroll to an element by ID (copied from RestaurantMarker attempt)
const scrollToItem = (id) => {
  const element = document.getElementById(`restaurant-item-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Optional: Add a visual cue like a temporary highlight
    element.style.transition = 'background-color 0.5s ease-in-out';
    element.style.backgroundColor = 'rgba(0, 188, 212, 0.3)';
    setTimeout(() => {
      element.style.backgroundColor = ''; // Reset background
    }, 1500); // Remove highlight after 1.5 seconds
  } else {
    console.warn(`Element with ID restaurant-item-${id} not found. It might be on a different page or section.`);
    // Optionally, provide feedback to the user that the item isn't visible
    toast.warn("Restaurant not currently visible in the list. It might be in a different section or page."); // Use toast for feedback
  }
};

// Create custom icons for different types of restaurants
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0Z" 
        fill="${color}" stroke="white" stroke-width="1" />
      <circle cx="12" cy="8" r="3.5" fill="white" />
    </svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Define icons for different restaurant types
const visitedIcon = createCustomIcon('#00bcd4');
const toVisitIcon = createCustomIcon('#ff4081');
const recommendedIcon = createCustomIcon('#ffc107');

const MapWrapper = styled.div`
  width: 90%;
  height: 500px;
  margin: 20px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  scroll-margin-top: 80px;
  position: relative;
`;

const MapLegend = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(26, 26, 26, 0.8);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  
  h4 {
    margin: 0 0 8px 0;
    color: #f5f5f5;
    font-size: 14px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    font-size: 12px;
    color: #f5f5f5;
  }
  
  .legend-color {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    margin-right: 8px;
    border: 1px solid white;
  }
`;

// Helper function to capitalize the first letter of each word in the address
function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

// Component to handle map view changes
function MapController({ selectedLocation, focusId }) {
  const map = useLeafletMap();
  const mapElementRef = map.getContainer(); // Get map container element

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.lat, selectedLocation.lng],
        16, // Zoom level
        { animate: true, duration: 1.5, easeLinearity: 0.5 } // Adjusted duration/easing
      );

      // Scroll map container into view
      if (mapElementRef) {
        // Use a slight delay to ensure flyTo starts
        setTimeout(() => {
            mapElementRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150); // Delay slightly longer than item scroll
      }
    }
    // focusId dependency ensures this runs even if selectedLocation object is the same
  }, [selectedLocation, focusId, map, mapElementRef]);

  return null; // This component does not render anything itself
}

function RestaurantMap({ restaurants }) {
  const position = [43.1566, -77.6088]; // center on Rochester, NY
  const { selectedLocation, focusId } = useMap();
  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  // Separate restaurants by type
  const visitedRestaurants = restaurants.filter(r => r.rating !== undefined || r.averageRating !== undefined);
  const toVisitRestaurants = restaurants.filter(r => r.rating === undefined && r.averageRating === undefined && !r.recommended);
  const recommendedRestaurants = restaurants.filter(r => r.recommended);

  return (
    <MapWrapper ref={wrapperRef} id="restaurant-map">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapController selectedLocation={selectedLocation} focusId={focusId} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Visited Restaurants */}
        {visitedRestaurants.map((restaurant) =>
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <RestaurantMarker
              key={restaurant.id}
              restaurant={restaurant}
              icon={visitedIcon}
            >
              <Popup>
                {/* Make name clickable */}
                <strong
                  style={{ cursor: 'pointer', color: '#00bcd4' }}
                  onClick={() => scrollToItem(restaurant.id)} // Use helper function
                  title="Scroll to item in list"
                >
                  {restaurant.name}
                </strong>
                <br />
                {/* Make address clickable */}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant.address);
                    toast.info('Address copied to clipboard!');
                  }}
                  title="Copy address"
                >
                  {capitalizeWords(restaurant.address)} <FiCopy size="0.8em" style={{ verticalAlign: 'middle', marginLeft: '4px' }}/>
                </span>
                <div style={{ marginTop: '5px' }}>
                  {restaurant.averageRating
                    ? `Rating: ${restaurant.averageRating} / 5`
                    : 'No ratings available'}
                </div>
              </Popup>
            </RestaurantMarker>
          ) : null
        )}

        {/* To Visit Restaurants */}
        {toVisitRestaurants.map((restaurant) =>
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <RestaurantMarker
              key={restaurant.id}
              restaurant={restaurant}
              icon={toVisitIcon}
            >
              <Popup>
                {/* Make name clickable */}
                <strong
                  style={{ cursor: 'pointer', color: '#00bcd4' }}
                  onClick={() => scrollToItem(restaurant.id)} // Use helper function
                  title="Scroll to item in list"
                >
                  {restaurant.name}
                </strong>
                <br />
                {/* Make address clickable */}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant.address);
                    toast.info('Address copied to clipboard!');
                  }}
                  title="Copy address"
                >
                  {capitalizeWords(restaurant.address)} <FiCopy size="0.8em" style={{ verticalAlign: 'middle', marginLeft: '4px' }}/>
                </span>
                <div style={{ marginTop: '5px', color: '#ff4081' }}>
                  On your "To Visit" list
                </div>
              </Popup>
            </RestaurantMarker>
          ) : null
        )}

        {/* Recommended Restaurants */}
        {recommendedRestaurants.map((restaurant) =>
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <RestaurantMarker
              key={restaurant.id}
              restaurant={restaurant}
              icon={recommendedIcon}
            >
              <Popup>
                {/* Make name clickable */}
                <strong
                  style={{ cursor: 'pointer', color: '#00bcd4' }}
                  onClick={() => scrollToItem(restaurant.id)} // Use helper function
                  title="Scroll to item in list"
                >
                  {restaurant.name}
                </strong>
                <br />
                {/* Make address clickable */}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant.address);
                    toast.info('Address copied to clipboard!');
                  }}
                  title="Copy address"
                >
                  {capitalizeWords(restaurant.address)} <FiCopy size="0.8em" style={{ verticalAlign: 'middle', marginLeft: '4px' }}/>
                </span>
                <div style={{ marginTop: '5px', color: '#ffc107' }}>
                  Recommended
                </div>
              </Popup>
            </RestaurantMarker>
          ) : null
        )}
      </MapContainer>
      
      <MapLegend>
        <h4>Map Legend</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#00bcd4' }}></div>
          <span>Visited</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff4081' }}></div>
          <span>To Visit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Recommended</span>
        </div>
      </MapLegend>
    </MapWrapper>
  );
}

export default RestaurantMap;
