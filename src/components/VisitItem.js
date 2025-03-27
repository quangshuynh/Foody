import React from 'react';
import styled from 'styled-components';
import { FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
  svg {
    cursor: pointer;
    color: #00bcd4;
    transition: color 0.3s;
    &:hover {
      color: #00a1b5;
    }
  }
`;

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
`;

function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function VisitItem({ restaurant, removeToVisit }) {
  const { isAuthenticated } = useAuth();
  const { focusLocation } = useMap();

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeToVisit(restaurant.id);
    }
  };

  const handleMapFocus = (location) => {
    focusLocation(location);
    const mapElement = document.getElementById('restaurant-map');
    if (mapElement) {
      setTimeout(() => {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <ItemContainer>
      <IconContainer>
        <FaMapMarkerAlt 
          onClick={() => handleMapFocus(restaurant.location)} 
          title="Show on Map"
          style={{ color: '#ff4081' }}
        />
        {isAuthenticated && (
          <FaTrash onClick={handleRemove} title="Remove" />
        )}
      </IconContainer>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3
          style={{
            fontFamily: "'aligarh', sans-serif",
            color: '#f5f5f5',
            fontSize: '1.7rem',
            letterSpacing: '1px',
            marginBottom: '2px'
          }}
        >
          {restaurant.name}
        </h3>
      </div>
      {restaurant.address && (
        <p
          style={{
            fontFamily: "'playfair', sans-serif",
            fontSize: '1.1rem',
            color: '#fff',
            marginTop: '0',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <a
		  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)} ${encodeURIComponent(restaurant.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#b4c2fa', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {capitalizeWords(restaurant.address)}
          </a>
          <FiCopy
            onClick={() => {
              navigator.clipboard.writeText(restaurant.address);
              alert('Address copied to clipboard!');
            }}
            title="Copy address to clipboard"
            style={{ color: '#00bcd4', cursor: 'pointer', marginLeft: '10px', fontSize: '1rem' }}
          />
        </p>
      )}
      {restaurant.dateAdded && (
        <DateText>Added on: {new Date(restaurant.dateAdded).toLocaleString()}</DateText>
      )}
    </ItemContainer>
  );
}

export default VisitItem;
