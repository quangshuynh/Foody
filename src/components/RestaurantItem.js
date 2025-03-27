import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Rating from './Rating';
import Comments from './Comments';
import { FaTrash, FaEdit, FaStar, FaComment, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import RatingModal from './RatingModal';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import { db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from '../services/auditLogService'; 

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  position: relative;
  
  @media (max-width: 480px) {
    width: 95%;
    padding: 15px;
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

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
  margin: 0;
  text-align: center;
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

function RestaurantItem({ restaurant, updateRestaurant, removeRestaurant }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(restaurant.name);
  const [editAddress, setEditAddress] = useState(restaurant.address);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { focusLocation } = useMap();
  const itemRef = useRef(null); // Add a ref for the item container

  const handleMapFocus = (location) => {
    if (location) {
      focusLocation(location); // Trigger map flyTo
      // Scroll the item into view
      if (itemRef.current) {
        // Use a slight delay to allow map animation to start
        setTimeout(() => {
          itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } else {
      console.warn("Attempted to focus map with no location data.");
    }
  };

  const handleRatingSubmit = async (rating, wouldReturn, comment = '') => {
    if (!user) {
      alert('Please log in to rate this restaurant.');
      return;
    }

    const restaurantDocRef = doc(db, 'visitedRestaurants', restaurant.id);

    try {
      // Fetch the current document to get the latest ratings array
      const docSnap = await getDoc(restaurantDocRef);
      if (!docSnap.exists()) {
        throw new Error("Restaurant document not found.");
      }
      const currentData = docSnap.data();
      const currentRatings = currentData.ratings || [];

      // Find existing rating by the current user
      const existingRating = currentRatings.find(r => r.userId === user.uid);

      const newRatingData = {
        userId: user.uid, // Use uid
        userEmail: user.email, // Store email (or displayName if available)
        rating,
        wouldReturn,
        comment: comment.trim(), // Trim comment
        date: Timestamp.fromDate(new Date()) // Use Firestore Timestamp
      };

      let ratingsUpdate = [];
      let averageRating = 0;

      if (existingRating) {
        // Atomically remove the old rating and add the new one
        await updateDoc(restaurantDocRef, {
          ratings: arrayRemove(existingRating)
        });
        await updateDoc(restaurantDocRef, {
          ratings: arrayUnion(newRatingData)
        });
        // Recalculate based on the new state (fetch again or calculate locally)
        const updatedDocSnap = await getDoc(restaurantDocRef); // Fetch again to be safe
        ratingsUpdate = updatedDocSnap.data().ratings || [];
      } else {
        // Atomically add the new rating
        await updateDoc(restaurantDocRef, {
          ratings: arrayUnion(newRatingData)
        });
        ratingsUpdate = [...currentRatings, newRatingData]; // Optimistic local update
      }

      // Calculate new average rating
      if (ratingsUpdate.length > 0) {
        averageRating = ratingsUpdate.reduce((acc, r) => acc + r.rating, 0) / ratingsUpdate.length;
      }

      // Update the average rating in Firestore
      await updateDoc(restaurantDocRef, {
        averageRating: Math.round(averageRating * 10) / 10
      });

      // Update local state via the prop from App.js
      updateRestaurant({
        ...restaurant,
        ratings: ratingsUpdate.map(r => ({ // Convert Timestamps back for local state if needed
          ...r,
          date: r.date.toDate()
        })),
        averageRating: Math.round(averageRating * 10) / 10
      });

      // Log the audit event *after* successful rating update/add
      await logAuditEvent(
        existingRating ? 'UPDATE_RATING' : 'CREATE_RATING',
        'visitedRestaurants',
        restaurant.id,
        { rating: newRatingData.rating, wouldReturn: newRatingData.wouldReturn, commentProvided: !!newRatingData.comment }
      );

      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to update rating:', error);
      alert(`Failed to update rating: ${error.message}. Please try again.`); // Keep user feedback
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeRestaurant(restaurant.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(restaurant.name);
    setEditAddress(restaurant.address);
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editName || !editAddress) {
      setEditError('Please fill in all fields');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      if (editAddress !== restaurant.address) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editAddress)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          // Call the updateRestaurant prop (which calls the service)
          // The service handles the updateDoc call and adds timestamps
          updateRestaurant({
            ...restaurant, // Pass existing data
            name: editName.trim(), // Trim name
            address: editAddress.trim(), // Trim address
            location: { lat: parseFloat(lat), lng: parseFloat(lon) },
          });
          setIsEditing(false);
        } else {
          setEditError('Address not found. Please enter a valid address.');
        }
      } else {
        // Only name changed, update that
        updateRestaurant({
          ...restaurant, // Pass existing data
          name: editName.trim() // Trim name
        });
        setIsEditing(false);
      }
    } catch (err) {
      setEditError('Error fetching location. Please try again.');
    }
    setEditLoading(false);
  };

  return (
    // Attach the ref to the main container
    <ItemContainer ref={itemRef}>
      <IconContainer>
        <FaMapMarkerAlt 
          onClick={() => handleMapFocus(restaurant.location)} 
          title="Show on Map"
          style={{ color: '#ff4081' }}
        />
        {isAuthenticated && (
          <>
            <FaEdit onClick={handleEdit} title="Edit" />
            <FaStar onClick={() => setShowRatingModal(true)} title="Rate" />
            <FaTrash onClick={handleRemove} title="Remove" />
          </>
        )}
        <FaComment onClick={() => setShowComments(!showComments)} title="Comments" />
      </IconContainer>


      {showRatingModal && (
        <RatingModal
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
          // Use user.uid to find the current user's rating
          currentRating={(restaurant.ratings || []).find(r => r?.userId === user?.uid)?.rating || 0}
        />
      )}

      {isEditing ? (
        <>
          <Input1
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Restaurant Name (e.g., Dogtown)" 
          />
          <Input2
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="Street Address (e.g., 691 Monroe Ave)" 
          />
          {editError && <p style={{ color: '#ff4081' }}>{editError}</p>}
          <Button onClick={handleEditSave} disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleEditCancel} style={{ marginLeft: '10px', background: '#ff4081' }}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ 
              fontFamily: "'aligarh', sans-serif", 
              color: '#f5f5f5', 
              fontSize: '1.7rem',
              letterSpacing: '1px',
              marginBottom: '2px'
            }}>
              {restaurant.name}
            </h3>
          </div>
          {restaurant.address && (
            <p style={{ 
              fontFamily: "'playfair', sans-serif", 
              fontSize: '1.1rem', 
              color: '#fff',
              marginTop: '0',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
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
                  toast.info('Address copied to clipboard!'); // Use toast
                }}
                title="Copy address to clipboard"
                style={{ color: '#00bcd4', cursor: 'pointer', marginLeft: '10px', fontSize: '1rem' }}
              />
            </p>
          )}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <DateWrapper>
            <DateText>Added on: {restaurant.dateAdded ? (restaurant.dateAdded.toDate ? restaurant.dateAdded.toDate().toLocaleString() : new Date(restaurant.dateAdded).toLocaleString()) : 'N/A'}</DateText>
              {restaurant.updatedAt && (
                <Tooltip className="tooltip"> Updated on: {restaurant.updatedAt ? (restaurant.updatedAt.toDate ? restaurant.updatedAt.toDate().toLocaleString() : new Date(restaurant.updatedAt).toLocaleString()) : 'N/A'}</Tooltip>              
              )}
            </DateWrapper>
          </div>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Rating rating={restaurant.averageRating} />
          </div>
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

export default RestaurantItem;
