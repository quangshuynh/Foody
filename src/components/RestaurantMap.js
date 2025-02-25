import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMap } from '../contexts/MapContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapWrapper = styled.div`
  width: 90%;
  height: 500px;
  margin: 20px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  scroll-margin-top: 80px;
`;

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
        {restaurants.map((restaurant) => (
          restaurant.location && restaurant.location.lat && restaurant.location.lng ? (
            <Marker 
              key={restaurant.id} 
              position={[restaurant.location.lat, restaurant.location.lng]}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {restaurant.address}
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </MapWrapper>
  );
}

export default RestaurantMap;
