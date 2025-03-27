import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet'; // Import Popup
import { useMap } from '../contexts/MapContext';
import { toast } from 'react-toastify'; // Import toast
import { FiCopy } from 'react-icons/fi'; // Import FiCopy

// Helper function to scroll to an element by ID
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
      {/* Use the Popup component passed via children, but add click handlers */}
      {React.Children.map(children, child => {
        if (child.type === Popup) {
          // Clone the Popup to modify its content
          return React.cloneElement(child, {}, (
            <>
              {/* Make name clickable */}
              <strong
                style={{ cursor: 'pointer', color: '#00bcd4' }}
                onClick={() => scrollToItem(restaurant.id)}
                title="Scroll to item in list"
              >
                {restaurant.name}
              </strong>
              <br />
              {/* Make address clickable for copy */}
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigator.clipboard.writeText(restaurant.address);
                  toast.info('Address copied to clipboard!'); // Use toast
                }}
                title="Copy address"
              >
                {restaurant.address} <FiCopy size="0.8em" style={{ verticalAlign: 'middle', marginLeft: '4px' }}/>
              </span>
              {/* Render original extra content from Popup if any */}
              {child.props.children.slice(2)}
            </>
          ));
        }
        return child; // Return other children unmodified
      })}
    </Marker>
  );
}

export default RestaurantMarker;
