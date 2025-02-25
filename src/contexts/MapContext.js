import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <MapContext.Provider value={{ selectedLocation, setSelectedLocation }}>
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
