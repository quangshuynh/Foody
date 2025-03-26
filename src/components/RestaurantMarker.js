import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';
import { useMap } from '../contexts/MapContext';

function RestaurantMarker({ restaurant, icon, children }) {
  const markerRef = useRef();
  const { selectedLocation, focusId } = useMap();

  useEffect(() => {
    if (
      selectedLocation &&
      restaurant.location &&
      Math.abs(restaurant.location.lat - selectedLocation.lat) < 0.0001 &&
      Math.abs(restaurant.location.lng - selectedLocation.lng) < 0.0001
    ) {
      markerRef.current?.openPopup();
    }
  }, [selectedLocation, focusId, restaurant.location]);

  return (
    <Marker
      ref={markerRef}
      position={[restaurant.location.lat, restaurant.location.lng]}
      icon={icon}
    >
      {children}
    </Marker>
  );
}

export default RestaurantMarker;
