import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, useMap as useLeafletMap } from 'react-leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import '../styles/MapDarkMode.css';
import L from 'leaflet';
import { useMap } from '../contexts/MapContext';
import RestaurantMarker from './RestaurantMarker';
import { toast } from 'react-toastify'; 
import { FiCopy } from 'react-icons/fi';

const scrollToItem = (id) => {
  const element = document.getElementById(`restaurant-item-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.transition = 'background-color 0.5s ease-in-out';
    element.style.backgroundColor = 'rgba(0, 188, 212, 0.3)';
    setTimeout(() => { element.style.backgroundColor = ''; }, 1500);
  } else {
    console.warn(`Element with ID restaurant-item-${id} not found.`);
    toast.warn("Restaurant not currently visible in the list. It might be in a different section or page.");
  }
};

const createCustomIcon = (color) => L.divIcon({
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

const capitalizeWords = str =>
  str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

const MapController = ({ selectedLocation, focusId }) => {
  const map = useLeafletMap();
  const mapElement = map.getContainer();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, { animate: true, duration: 1.5, easeLinearity: 0.5 });
      if (mapElement) {
        setTimeout(() => {
          mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [selectedLocation, focusId, map, mapElement]);

  return null;
};

const handleCopyAddress = (address) => {
  navigator.clipboard.writeText(address);
  toast.info('Address copied to clipboard!');
};

const RestaurantPopup = ({ restaurant, color, label, showRating }) => (
  <Popup>
    <strong 
      style={{ cursor: 'pointer', color }} 
      onClick={() => scrollToItem(restaurant.id)} 
      title="Scroll to item in list"
    >
      {restaurant.name}
    </strong>
    <br />
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}+${encodeURIComponent(restaurant.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in Google Maps"
        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
      >
        {capitalizeWords(restaurant.address)}
      </a>
      <FiCopy 
        size="0.8em" 
        style={{ verticalAlign: 'middle', marginLeft: '4px', color: '#00bcd4', cursor: 'pointer' }} 
        onClick={() => handleCopyAddress(restaurant.address)} 
        title="Copy address"
      />
    </span>
    {showRating && (
      <div style={{ marginTop: '5px' }}>
        {restaurant.averageRating ? `Rating: ${restaurant.averageRating} / 5` : 'No ratings available'}
      </div>
    )}
    <div style={{ marginTop: '5px', color }}>
      {label}
    </div>
  </Popup>
);

const renderMarkers = (restaurants, icon, color, label, showRating = false) =>
  restaurants.map(restaurant =>
    restaurant.location?.lat && restaurant.location?.lng ? (
      <RestaurantMarker key={restaurant.id} restaurant={restaurant} icon={icon}>
        <RestaurantPopup restaurant={restaurant} color={color} label={label} showRating={showRating} />
      </RestaurantMarker>
    ) : null
  );

const RestaurantMap = ({ visitedRestaurants, toVisitRestaurants, recommendedRestaurants }) => {
  const defaultPosition = [43.1566, -77.6088];
  const { selectedLocation, focusId } = useMap();
  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  return (
    <MapWrapper ref={wrapperRef} id="restaurant-map">
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <MapController selectedLocation={selectedLocation} focusId={focusId} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {renderMarkers(visitedRestaurants, visitedIcon, '#00bcd4', 'On your "Visited" list', true)}
        {renderMarkers(toVisitRestaurants, toVisitIcon, '#ff4081', 'On your "To Visit" list')}
        {renderMarkers(recommendedRestaurants, recommendedIcon, '#ffc107', 'On your "Recommended" list')}
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
};

export default RestaurantMap;
