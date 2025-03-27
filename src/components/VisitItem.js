import React, { useState } from 'react'; // Import useState
import styled from 'styled-components';
// Import necessary icons and components
import { FaTrash, FaMapMarkerAlt, FaEdit, FaStar, FaComment } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import Rating from './Rating'; // Import Rating component
import Comments from './Comments'; // Import Comments component
import RatingModal from './RatingModal'; // Import RatingModal component
import { db } from '../firebaseConfig'; // Import db for potential direct updates if needed
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from '../services/auditLogService';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); // Added shadow like RestaurantItem

  @media (max-width: 480px) { // Added responsive width like RestaurantItem
    width: 95%;
    padding: 15px;
  }
`;

// Reusing styles from RestaurantItem for consistency
const Input1 = styled.input`
  width: 100%;
  padding: 11px 4px;
  margin: 8px 0;
  text-indent: 5px;
  border: 1px solid #00bcd4;
  border-radius: 8px;
  background: #1e1e1e;
  color: #fff;
  transition: border 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  margin-top: 25px;

  font-family: 'Roboto', sans-serif;
  font-size: 16px;

  &:focus {
    border-color: #ff4081;
    box-shadow: 0 0 8px rgba(255, 64, 129, 0.5);
  }
`;

const Input2 = styled.input`
  width: 100%;
  padding: 11px 4px;
  margin: 8px 0;
  text-indent: 5px;
  border: 1px solid #00bcd4;
  border-radius: 8px;
  background: #1e1e1e;
  color: #fff;
  transition: border 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  margin-top: 4px;

  font-family: 'Roboto', sans-serif;
  font-size: 16px;

  &:focus {
    border-color: #ff4081;
    box-shadow: 0 0 8px rgba(255, 64, 129, 0.5);
  }
`;

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
  &:hover {
    background: #00a1b5;
  }
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
  margin: 0; // Reset margin
  text-align: center; // Center align
`;

// Added DateWrapper and Tooltip from RestaurantItem
const DateWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin-top: 5px;

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  background-color: rgba(50, 50, 50, 0.85);
  color: #fff;
  text-align: center;
  border-radius: 8px;
  padding: 10px 12px;
  position: absolute;
  z-index: 1;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  min-width: 220px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px;
    border-style: solid;
    border-color: rgba(50, 50, 50, 0.85) transparent transparent transparent;
  }
`;


function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

// Added updateToVisit prop
function VisitItem({ restaurant, removeToVisit, updateToVisit }) {
  const { user, isAuthenticated } = useAuth(); // Get user for rating
  const { focusLocation } = useMap();

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(restaurant.name);
  const [editAddress, setEditAddress] = useState(restaurant.address);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // State for rating and comments
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showComments, setShowComments] = useState(false); // Added comments state

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeToVisit(restaurant.id);
    }
  };

  // Simplified map focus handler - relies on MapContext and flyTo effect
  const handleMapFocus = (location) => {
    if (location) {
      focusLocation(location);
      // No need for scrollIntoView here, MapController handles centering
    } else {
      console.warn("Attempted to focus map with no location data.");
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
          {/* Added Rating display */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Rating rating={restaurant.averageRating} />
          </div>
          {/* Added Date display with Tooltip */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <DateWrapper>
              <DateText>Added on: {restaurant.dateAdded ? (restaurant.dateAdded.toDate ? restaurant.dateAdded.toDate().toLocaleString() : new Date(restaurant.dateAdded).toLocaleString()) : 'N/A'}</DateText>
              {restaurant.updatedAt && (
                <Tooltip className="tooltip"> Updated on: {restaurant.updatedAt ? (restaurant.updatedAt.toDate ? restaurant.updatedAt.toDate().toLocaleString() : new Date(restaurant.updatedAt).toLocaleString()) : 'N/A'}</Tooltip>
              )}
            </DateWrapper>
          </div>
          {/* Added Comments display */}
          {showComments && (
            <Comments
              comments={(restaurant.ratings || [])
                .filter(r => r?.comment)
                .sort((a, b) => new Date(b.date) - new Date(a.date))}
            />
          )}
        </>
      )}
    </ItemContainer>
  );
}

export default VisitItem;
