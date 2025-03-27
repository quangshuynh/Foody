import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet'; // Popup is passed via children
import { useMap } from '../contexts/MapContext';
// Removed toast, FiCopy, and scrollToItem helper

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
      {/* Simply render children (which includes the Popup defined in RestaurantMap) */}
      {children}
    </Marker>
  );
}

export default RestaurantMarker;
