import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import './MapDarkMode.css';
import L from 'leaflet';
import { useMap } from '../contexts/MapContext';

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
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.lat, selectedLocation.lng], 
        16, 
        { animate: true, duration: 1.5 }
      );
      
      // Center the map on the screen
      map.once('moveend', () => {
        map.panInside([selectedLocation.lat, selectedLocation.lng], {
          padding: [50, 50],
          animate: true
        });
      });
    }
  }, [selectedLocation, focusId, map]);
  
  return null;
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
            <Marker
              key={restaurant.id}
              position={[restaurant.location.lat, restaurant.location.lng]}
              icon={visitedIcon}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {capitalizeWords(restaurant.address)}
                <div style={{ marginTop: '5px' }}>
                  {restaurant.averageRating
                    ? `Rating: ${restaurant.averageRating} / 5`
                    : 'No ratings available'}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* To Visit Restaurants */}
        {toVisitRestaurants.map((restaurant) => (
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <Marker 
              key={restaurant.id} 
              position={[restaurant.location.lat, restaurant.location.lng]}
              icon={toVisitIcon}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {capitalizeWords(restaurant.address)}
                <div style={{ marginTop: '5px', color: '#ff4081' }}>
                  On your "To Visit" list
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        
        {/* Recommended Restaurants */}
        {recommendedRestaurants.map((restaurant) => (
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <Marker 
              key={restaurant.id} 
              position={[restaurant.location.lat, restaurant.location.lng]}
              icon={recommendedIcon}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {capitalizeWords(restaurant.address)}
                <div style={{ marginTop: '5px', color: '#ffc107' }}>
                  Recommended
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
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
