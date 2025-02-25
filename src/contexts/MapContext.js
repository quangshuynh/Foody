import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [focusId, setFocusId] = useState(0);

  // This function ensures we trigger a re-render even when selecting the same location
  const focusLocation = (location) => {
    setSelectedLocation(location);
    setFocusId(prevId => prevId + 1); // Increment the ID to force a re-render
  };

  return (
    <MapContext.Provider value={{ 
      selectedLocation, 
      setSelectedLocation,
      focusId,
      focusLocation
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
