import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  margin: 20px 0;
`;

function RestaurantMap({ restaurants }) {
  const position = [43.1566, -77.6088]; // center on Rochester, NY
  return (
    <MapWrapper>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {restaurants.map((restaurant) => (
          <Marker key={restaurant.id} position={[restaurant.location.lat, restaurant.location.lng]}>
            <Popup>
              <strong>{restaurant.name}</strong>
              <br />
              {restaurant.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
}

export default RestaurantMap;
